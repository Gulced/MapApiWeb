import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";
import { Button, TextField, Box } from "@mui/material";
import "leaflet/dist/leaflet.css";

// Marker objesinde lat/lng dönüştürücü yardımcı fonksiyon
function getLatLng(marker) {
  // Eğer marker.lat ve marker.lng varsa direkt al
  if (marker.lat !== undefined && marker.lng !== undefined) {
    return [marker.lat, marker.lng];
  }
  // Eğer location.coordinates şeklinde geldiyse (örn: [lng, lat])
  if (
    marker.location &&
    Array.isArray(marker.location.coordinates) &&
    marker.location.coordinates.length === 2
  ) {
    return [marker.location.coordinates[1], marker.location.coordinates[0]];
  }
  // Hatalıysa undefined döndür
  return undefined;
}

function MapPage() {
  const [markers, setMarkers] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editMarkerId, setEditMarkerId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // 1️⃣ Markerları backend'den çek
  useEffect(() => {
    fetchMarkers();
    // eslint-disable-next-line
  }, []);

  const fetchMarkers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5143/api/MapPoints", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Konsolda gör
      console.log("Gelen markerlar:", res.data);
      // Dönüştür, hatalıları filtrele
      setMarkers(
        res.data
          .map(m => {
            const latlng = getLatLng(m);
            if (!latlng) return null;
            return {
              ...m,
              lat: latlng[0],
              lng: latlng[1],
            };
          })
          .filter(Boolean)
      );
    } catch (err) {
      alert("Marker çekilemedi: " + err.message);
    }
  };

  // 2️⃣ Harita üstüne tıklayınca yeni marker ekleme
  function AddMarkerOnClick() {
    useMapEvents({
      click(e) {
        setAdding(true);
        setNewTitle("");
        setNewDesc("");
        setMarkers((prev) =>
          prev.filter((m) => m.id !== "temp")
        );
        setMarkers((prev) => [
          ...prev,
          {
            id: "temp",
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            title: "",
            description: "",
            isTemp: true,
          },
        ]);
      },
    });
    return null;
  }

  // 3️⃣ Marker ekle
  const handleAdd = async () => {
    const temp = markers.find((m) => m.id === "temp");
    if (!temp) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5143/api/MapPoints",
        {
          title: newTitle,
          description: newDesc,
          lat: temp.lat,
          lng: temp.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Yeni eklenen marker'ı dönüştür ve ekle
      const latlng = getLatLng(res.data) || [temp.lat, temp.lng];
      setMarkers((prev) => [
        ...prev.filter((m) => m.id !== "temp"),
        {
          ...res.data,
          lat: latlng[0],
          lng: latlng[1]
        }
      ]);
      setAdding(false);
    } catch (err) {
      alert("Ekleme başarısız: " + err.message);
    }
  };

  // 4️⃣ Marker sil
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5143/api/MapPoints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarkers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Silme başarısız: " + err.message);
    }
  };

  // 5️⃣ Marker güncelle
  const handleEdit = (marker) => {
    setEditMarkerId(marker.id);
    setEditTitle(marker.title);
    setEditDesc(marker.description);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5143/api/MapPoints/${editMarkerId}`,
        {
          title: editTitle,
          description: editDesc,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMarkers((prev) =>
        prev.map((m) =>
          m.id === editMarkerId
            ? { ...m, title: editTitle, description: editDesc }
            : m
        )
      );
      setEditMarkerId(null);
    } catch (err) {
      alert("Güncelleme başarısız: " + err.message);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100vh", width: "100vw" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AddMarkerOnClick />
        {markers.map((marker) =>
          marker.isTemp ? (
            <Marker position={[marker.lat, marker.lng]} key="temp">
              <Popup>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Başlık"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <TextField
                    label="Açıklama"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleAdd}>
                    Ekle
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => setAdding(false)}>
                    Vazgeç
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ) : (
            <Marker position={[marker.lat, marker.lng]} key={marker.id}>
              <Popup>
                {editMarkerId === marker.id ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Başlık"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <TextField
                      label="Açıklama"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleUpdate}>
                      Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setEditMarkerId(null)}
                    >
                      Vazgeç
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <b>{marker.title}</b>
                    <div>{marker.description}</div>
                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(marker)}
                      sx={{ mt: 1, mb: 0.5 }}
                    >
                      Güncelle
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(marker.id)}
                      sx={{ mb: 1 }}
                    >
                      Sil
                    </Button>
                  </Box>
                )}
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}

export default MapPage;
