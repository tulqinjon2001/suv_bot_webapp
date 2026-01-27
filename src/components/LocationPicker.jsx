import { useState, useEffect, useRef } from "react";

export default function LocationPicker({ onSelect, initialLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const placemarkRef = useRef(null);

  // Tashkent markazi koordinatasi
  const defaultCenter = [41.2995, 69.2401];

  // Yandex Maps API-ni yuklash
  useEffect(() => {
    if (!window.ymaps) {
      const script = document.createElement("script");
      script.src = "https://api-maps.yandex.ru/2.1/?apikey=free&lang=uz_UZ";
      script.async = true;
      script.onload = () => {
        if (window.ymaps) {
          window.ymaps.ready(() => {
            console.log("Yandex Maps API loaded");
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const initializeMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      try {
        // Eski xarita instance-ni o'chirib tashla
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const mapCenter = location
          ? [location.lat, location.long]
          : defaultCenter;

        // Yangi xarita yaratish
        mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 13,
          controls: ["zoomControl"],
        });

        // Agar location mavjud bo'lsa, marker qo'shish
        if (location) {
          addPlacemark(location.lat, location.long);
        }

        // Xarita bosilganda marker qo'shish
        mapInstanceRef.current.events.add("click", (e) => {
          const coords = e.get("coords");
          const newLocation = {
            lat: coords[0],
            long: coords[1],
          };
          setLocation(newLocation);
          addPlacemark(coords[0], coords[1]);
        });
      } catch (err) {
        console.error("Xaritani yuklashda xatolik:", err);
      }
    });
  };

  const addPlacemark = (lat, lng) => {
    if (!mapInstanceRef.current || !window.ymaps) return;

    // Eski markerni o'chirib tashla
    if (placemarkRef.current) {
      mapInstanceRef.current.geoObjects.remove(placemarkRef.current);
      placemarkRef.current = null;
    }

    try {
      // Yangi marker yaratish
      placemarkRef.current = new window.ymaps.Placemark(
        [lat, lng],
        {
          balloonContent: "Tanlangan lokatsiya",
        },
        {
          preset: "islands#redDotIcon",
          draggable: true,
        },
      );

      // Markerni suring event-i
      placemarkRef.current.events.add("dragend", () => {
        const coords = placemarkRef.current.geometry.getCoordinates();
        setLocation({
          lat: coords[0],
          long: coords[1],
        });
      });

      mapInstanceRef.current.geoObjects.add(placemarkRef.current);
      mapInstanceRef.current.setCenter([lat, lng], 15);
    } catch (err) {
      console.error("Markerni qo'shishda xatolik:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Modal ochilganda xaritani initialize qil
      setTimeout(() => {
        initializeMap();
      }, 100);
    } else {
      // Modal yopilganda xaritani tozala
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
          placemarkRef.current = null;
        } catch (err) {
          console.error("Xaritani tozalashda xatolik:", err);
        }
      }
    }

    return () => {
      // Cleanup
      if (!isOpen && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
          placemarkRef.current = null;
        } catch (err) {
          console.error("Cleanup xatolik:", err);
        }
      }
    };
  }, [isOpen]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLocation = {
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          };
          setLocation(newLocation);
          addPlacemark(newLocation.lat, newLocation.long);
        },
        (error) => {
          alert("Lokatsiya olishda xatolik: " + error.message);
        },
      );
    } else {
      alert("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
    }
  };

  const handleSelect = () => {
    if (location) {
      onSelect(location);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Lokatsiya (ixtiyoriy)
      </label>

      {/* Tanlangan lokatsiyani ko'rsatish qismi */}
      {location ? (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">
              📍 {location.lat.toFixed(6)}, {location.long.toFixed(6)}
            </p>
            <button
              onClick={() => setLocation(null)}
              className="text-xs text-red-600 hover:font-semibold"
            >
              ✕ O'chirish
            </button>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Xaritada o'zgartirish
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-3 text-sm font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50"
        >
          📍 Xaritada joyni tanlash
        </button>
      )}

      {/* Modal - Xarita oynasi */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center sm:p-4">
          <div className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-white pb-4 sm:rounded-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:rounded-t-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Joyni tanlang
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Qidiruv va Hozirgi joylashuv */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Manzilni qidiring... (kelasi versiyada)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  disabled
                />
                <button
                  onClick={handleCurrentLocation}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100"
                  title="Hozirgi joylashuvni olish"
                >
                  📍
                </button>
              </div>
            </div>

            {/* Xarita idishi - Yandex Maps */}
            <div
              ref={mapRef}
              style={{ height: "400px", width: "100%", background: "#f1f5f9" }}
            />

            {/* Modal Footer */}
            <div className="space-y-3 px-4 pt-3">
              {location && (
                <div className="rounded-lg bg-slate-100 p-2 text-xs text-slate-600">
                  <p className="font-medium">
                    Tanlangan: {location.lat.toFixed(4)},{" "}
                    {location.long.toFixed(4)}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSelect}
                  disabled={!location}
                  className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
