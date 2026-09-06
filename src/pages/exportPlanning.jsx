import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MapPin, User, Download, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { coursService, filiereService } from "../services/supabaseService";

const DAYS = [
  { label: "LUNDI", value: "lundi" },
  { label: "MARDI", value: "mardi" },
  { label: "MERCREDI", value: "mercredi" },
  { label: "JEUDI", value: "jeudi" },
  { label: "VENDREDI", value: "vendredi" },
  { label: "SAMEDI", value: "samedi" },
];

const START_HOUR = 7;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
  const h = START_HOUR + i;
  return { start: h, label: `${h}h - ${h + 1}h` };
});

const hourToNumber = (h) => (h ? parseInt(h.split(":")[0], 10) : 0);

const ExportPlanning = () => {
  const { filiereId, niveauCode } = useParams();
  const [cours, setCours] = useState([]);
  const [filiereName, setFiliereName] = useState("");
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await coursService.getByFiliereAndNiveau(filiereId, niveauCode);
        setCours(data || []);
        const filiere = await filiereService.getById(filiereId);
        setFiliereName(filiere ? filiere.name : filiereId);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };
    fetchData();
  }, [filiereId, niveauCode]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `EDT_${filiereName}_${niveauCode}`,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* BARRE D'ACTION */}
      <div className="max-w-[1150px] mx-auto mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Printer size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 uppercase text-xs">Aperçu de l'emploi du temps</h2>
            <p className="text-blue-600 font-bold text-sm">{filiereName} - {niveauCode}</p>
          </div>
        </div>
        
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <Download size={18} />
          Télécharger le PDF
        </button>
      </div>

      {/* ZONE D'IMPRESSION */}
      <div className="max-w-[1150px] mx-auto bg-white shadow-xl overflow-x-auto">
        <div ref={componentRef} className="p-8 bg-white min-w-[1000px]">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page { size: A4 landscape; margin: 8mm; }
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
            
            .grid-container {
              display: grid;
              grid-template-columns: 100px repeat(${DAYS.length}, 1fr);
              /* On force une hauteur de ligne stricte */
              grid-auto-rows: 42px; 
              border: 1.5px solid #000;
            }

            .cell-header { 
              background: #111827 !important; 
              color: white !important; 
              border: 0.5px solid #374151;
              font-weight: 800; 
              font-size: 10px; 
              text-transform: uppercase;
              display: flex; align-items: center; justify-content: center;
              height: 45px;
            }

            .cell-time { 
              background: #f9fafb !important; 
              border: 0.5px solid #d1d5db;
              font-size: 10px; 
              font-weight: 700; 
              display: flex; align-items: center; justify-content: center;
              color: #374151;
            }

            .cell-empty { 
              border: 0.5px solid #e5e7eb;
              background: white;
            }

            .course-box { 
              background: #eff6ff !important; 
              border: 1px solid #3b82f6 !important;
              border-left: 4px solid #1d4ed8 !important;
              margin: 1px;
              padding: 4px 6px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: hidden;
              z-index: 10;
            }
          `}} />

          {/* TITRE DU DOCUMENT */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Planning Hebdomadaire des Cours</h1>
            <div className="flex justify-center gap-8 mt-2 py-2 border-y border-gray-200">
                <span className="text-xs font-bold uppercase"><strong className="text-gray-400">Filière:</strong> {filiereName}</span>
                <span className="text-xs font-bold uppercase"><strong className="text-gray-400">Niveau:</strong> {niveauCode}</span>
                <span className="text-xs font-bold uppercase"><strong className="text-gray-400">Année:</strong> 2025-2026</span>
            </div>
          </div>

          <div className="grid-container">
            {/* Ligne d'en-tête */}
            <div className="cell-header" style={{ height: '45px' }}>Heures</div>
            {DAYS.map(day => (
              <div key={day.value} className="cell-header" style={{ height: '45px' }}>{day.label}</div>
            ))}

            {/* Corps de la grille */}
            {HOURS.map((hObj, rowIndex) => (
              <React.Fragment key={hObj.start}>
                {/* Colonne des heures (Index de ligne + 2 car la ligne 1 est le header) */}
                <div className="cell-time" style={{ gridRow: rowIndex + 2 }}>
                  {hObj.label}
                </div>

                {DAYS.map((day, colIndex) => {
                  const item = cours.find(c => 
                    c.jour.toLowerCase() === day.value.toLowerCase() && 
                    hourToNumber(c.heure_debut) === hObj.start
                  );

                  const isOccupiedByPrevious = cours.some(c => {
                    const s = hourToNumber(c.heure_debut);
                    const e = hourToNumber(c.heure_fin);
                    return c.jour.toLowerCase() === day.value && hObj.start > s && hObj.start < e;
                  });

                  if (isOccupiedByPrevious) return null;

                  if (item) {
                    const start = hourToNumber(item.heure_debut);
                    const end = hourToNumber(item.heure_fin);
                    const span = end - start;
                    
                    return (
                      <div 
                        key={day.value} 
                        className="course-box" 
                        style={{ 
                          gridRow: `${rowIndex + 2} / span ${span}`,
                          gridColumn: colIndex + 2 
                        }}
                      >
                        <span className="text-[10px] font-black text-blue-900 leading-tight mb-1 uppercase line-clamp-2">
                          {item.matiere}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold">
                          <MapPin size={8} strokeWidth={3} /> {item.salle || "S. --"}
                        </div>
                        <div className="text-[9px] text-gray-500 font-semibold truncate mt-0.5">
                          <User size={8} className="inline mr-1" />
                          {item.professeur}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={day.value} 
                      className="cell-empty" 
                      style={{ 
                        gridRow: rowIndex + 2,
                        gridColumn: colIndex + 2 
                      }} 
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-end border-t border-gray-100 pt-4">
            <div className="text-[8px] text-gray-400 font-bold uppercase">
              Généré le {new Date().toLocaleDateString()} • Système de Gestion Académique
            </div>
            <div className="text-center border-t border-black w-48 pt-1">
               <p className="text-[9px] font-black uppercase">Signature Direction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPlanning;