import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat, toLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import axios from "axios";

function MapPage() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [markers, setMarkers] = useState([]);
  const [popup, setPopup] = useState({ open: false, marker: null, coords: null, mode: null });
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const isMarkerClickRef = useRef(false);

  // ROL VE USER ID
  const isAdmin = localStorage.getItem("role") === "Admin";
  const currentUserId = localStorage.getItem("userId");

  // --- MARKERLARI BACKEND'DEN ÇEK ---
  const fetchMarkers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5143/api/MapPoints", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend markerları {id, title, description, latitude, longitude, createdBy} ile döndürmeli!
      const markersData = res.data.map((m) => ({
        ...m,
        lat: m.latitude,
        lng: m.longitude,
        createdBy: m.createdBy,
      }));
      setMarkers(markersData.filter((m) => typeof m.lat === "number" && typeof m.lng === "number"));
    } catch (err) {
      alert("Marker çekilemedi: " + err.message);
    }
  };

  useEffect(() => { fetchMarkers(); }, []);

  // --- HARİTAYI OLUŞTUR ---
  useEffect(() => {
    if (map) return;
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSource }),
      ],
      view: new View({ center: fromLonLat([32.85, 39.93]), zoom: 6 }),
    });
    setMap(mapInstance);
    return () => mapInstance.setTarget(null);
  }, []);

  // --- MARKERLARI HARİTAYA EKLE ---
  useEffect(() => {
    vectorSource.clear();
    markers.forEach((marker) => {
      if (typeof marker.lng !== "number" || typeof marker.lat !== "number") return;
      const feature = new Feature({
        geometry: new Point(fromLonLat([marker.lng, marker.lat])),
        markerId: marker.id,
      });
      feature.setStyle(
        new Style({
          image: new Icon({
            src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            anchor: [0.5, 1],
            scale: 0.06,
          }),
        })
      );
      feature.set("data", marker);
      vectorSource.addFeature(feature);
    });
  }, [markers, vectorSource]);

  // --- MARKER'A TIKLANINCA POPUP AÇ ---
  useEffect(() => {
    if (!map) return;
    const markerHandler = (evt) => {
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const marker = feature.get("data");
        setPopup({ open: true, marker, coords: [marker.lng, marker.lat], mode: "edit" });
        setTitle(marker.title || "");
        setDesc(marker.description || "");
        found = true;
        isMarkerClickRef.current = true;
      });
      if (!found && popup.mode !== "add") {
        setPopup({ open: false, marker: null, coords: null, mode: null });
      }
    };
    map.on("click", markerHandler);
    return () => map.un("click", markerHandler);
  }, [map, popup.mode]);

  // --- HARİTAYA TIKLAYINCA YENİ MARKER EKLEME POPUP'I AÇ ---
  useEffect(() => {
    if (!map) return;
    const mapHandler = (evt) => {
      if (isMarkerClickRef.current) {
        isMarkerClickRef.current = false;
        return;
      }
      const coords = toLonLat(evt.coordinate);
      setPopup({ open: true, marker: null, coords, mode: "add" });
      setTitle("");
      setDesc("");
    };
    map.on("singleclick", mapHandler);
    return () => map.un("singleclick", mapHandler);
  }, [map]);

  // --- KAYDET/EKLE ---
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      if (popup.mode === "add") {
        await axios.post(
          "http://localhost:5143/api/MapPoints",
          {
            title,
            description: desc,
            latitude: popup.coords[1],
            longitude: popup.coords[0],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchMarkers(); // eklemeden sonra tekrar çek
      } else if (popup.mode === "edit" && popup.marker) {
        await axios.put(
          `http://localhost:5143/api/MapPoints/${popup.marker.id}`,
          {
            id: popup.marker.id,
            title,
            description: desc,
            latitude: popup.marker.lat,
            longitude: popup.marker.lng,
            createdBy: popup.marker.createdBy,
            isAdmin: isAdmin
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchMarkers(); // güncellemeden sonra tekrar çek
      }
      setPopup({ open: false, marker: null, coords: null, mode: null });
    } catch (err) {
      alert("Kaydetme başarısız: " + err.message);
    }
  };

  // --- SİL ---
  const handleDelete = async () => {
    if (!popup.marker) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5143/api/MapPoints/${popup.marker.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMarkers();
      setPopup({ open: false, marker: null, coords: null, mode: null });
    } catch (err) {
      alert("Silme başarısız: " + err.message);
    }
  };

  // ----------- RENDER -----------

  return (
    <div>
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />
      {/* === POPUP === */}
      {popup.open && (
        <div
          style={{
            position: "fixed",
            left: "50vw",
            top: "20vh",
            transform: "translate(-50%, 0)",
            background: "white",
            padding: 18,
            borderRadius: 14,
            boxShadow: "0 4px 16px #0002",
            minWidth: 260,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* SADECE ADMIN POPUP’INDA EKLEYEN BİLGİSİ */}
          {isAdmin && (
            <div style={{fontSize: "0.9em", color: "#888", marginBottom: 4}}>
              Ekleyen: {popup.marker?.createdBy || "-"}
            </div>
          )}
          <input
            type="text"
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <textarea
            placeholder="Açıklama"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
            rows={3}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={handleSave}>
              {popup.mode === "edit" ? "Kaydet" : "Ekle"}
            </button>
            {popup.mode === "edit" && (
              <button onClick={handleDelete} style={{ color: "red" }}>
                Sil
              </button>
            )}
            <button
              onClick={() => setPopup({ open: false, marker: null, coords: null, mode: null })}
              style={{ color: "#555" }}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
      {/* Sağ üstte Çıkış Yap butonu */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            window.location.href = "http://localhost:3000";
          }}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            background: "#e53935",
            color: "white",
            border: "none",
            fontWeight: "bold",
            fontSize: "1em",
            cursor: "pointer",
            boxShadow: "0 2px 8px #0002",
            letterSpacing: 1,
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

export default MapPage;
