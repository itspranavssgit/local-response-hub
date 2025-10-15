"use client"

import { useEffect, useRef } from "react"
// Import types only; these are erased at compile time and won't trigger runtime loading
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"

type Props = {
  center: { lat: number; lng: number }
  marker?: { lat: number; lng: number }
  onChange?: (coords: { lat: number; lng: number }) => void
}

let leafletLoadingPromise: Promise<any> | null = null

async function loadLeafletFromCDN(): Promise<any> {
  if (typeof window === "undefined") return null
  if ((window as any).L) return (window as any).L

  // Ensure CSS is present (avoid bundler CSS import to prevent MIME-type issues)
  const cssId = "leaflet-css-cdn"
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link")
    link.id = cssId
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  }

  if (!leafletLoadingPromise) {
    leafletLoadingPromise = new Promise((resolve, reject) => {
      const scriptId = "leaflet-js-cdn"
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null
      if (existing && (window as any).L) {
        resolve((window as any).L)
        return
      }
      const s = existing || document.createElement("script")
      s.id = scriptId
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      s.async = true
      s.defer = true
      s.crossOrigin = "anonymous"
      s.onload = () => resolve((window as any).L)
      s.onerror = (e) => reject(e)
      if (!existing) document.body.appendChild(s)
    })
  }
  return leafletLoadingPromise
}

export default function MapPicker({ center, marker, onChange }: Props) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let destroyed = false

    async function ensureLeafletAndCss() {
      const L = await loadLeafletFromCDN()
      if (!L || destroyed || !containerRef.current) return

      // Configure default marker icons via CDN asset paths
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        crossOrigin: true,
      })

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView([center.lat, center.lng], 13)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          crossOrigin: true,
        }).addTo(mapRef.current)

        mapRef.current.on("click", (e: any) => {
          const latlng = e.latlng as { lat: number; lng: number }
          setMarker(latlng.lat, latlng.lng)
        })
      }

      if (!markerRef.current) {
        markerRef.current = L.marker([center.lat, center.lng], { draggable: true }).addTo(mapRef.current!)
        markerRef.current.on("dragend", () => {
          const m = markerRef.current!.getLatLng()
          onChange?.({ lat: m.lat, lng: m.lng })
        })
      }

      if (mapRef.current) mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom())
      if (marker) markerRef.current!.setLatLng([marker.lat, marker.lng])

      function setMarker(lat: number, lng: number) {
        if (!markerRef.current) return
        markerRef.current.setLatLng([lat, lng])
        onChange?.({ lat, lng })
      }
    }

    ensureLeafletAndCss()
    return () => {
      destroyed = true
    }
  }, [center.lat, center.lng, marker, onChange])

  return <div ref={containerRef} className="h-full w-full" aria-label="Pickup location map" />
}
