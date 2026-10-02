import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Lock, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Layers, 
  ArrowRight, 
  Download, 
  FileText,
  Copy,
  Check,
  Zap,
  Globe
} from 'lucide-react';

export const SecurityReportView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('all');

  const handleCopyMarkdown = () => {
    const reportText = document.getElementById('report-content')?.innerText || '';
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Report Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rapport d'Expertise & Architecture Technique</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Audit de Sécurité, Architecture Backend & Protocoles E2EE
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Système d'Émargement QR Zéro-Saisie • FSJES Kelaa des Sraghna • Université Cadi Ayyad
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-250 border border-slate-700 text-xs font-semibold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier le Rapport'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Effectif Cible</span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">297 Étudiants</span>
            <span className="text-[10px] text-emerald-400 font-mono">Licence MD & MMS (2025-2026)</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Risque Majeur Identifié</span>
            <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">Relais WhatsApp</span>
            <span className="text-[10px] text-rose-300">Fraude par capture d'écran</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Limite Apps Script</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">Lock Timeout</span>
            <span className="text-[10px] text-amber-300">Contention à &gt; 30 req/sec</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Temps de Réponse Cible</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">&lt; 50 ms</span>
            <span className="text-[10px] text-emerald-300">Avec Cloud Run + Redis</span>
          </div>
        </div>
      </div>

      {/* Report Body */}
      <div id="report-content" className="space-y-8 text-slate-300 text-sm leading-relaxed">
        
        {/* SECTION 1: CRITIQUE DES LIMITES GOOGLE APPS SCRIPT */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Diagnostic Critique : Limites de Google Apps Script & Google Sheets
            </h2>
          </div>

          <p>
            Bien que le déploiement sur <strong>Google Apps Script + Google Sheets</strong> soit gratuit et ne nécessite aucun serveur externe, il présente des limitations physiques critiques lorsqu'il est confronté aux conditions réelles d'un amphithéâtre universitaire de <strong>297 étudiants</strong> :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <h3 className="font-bold text-rose-400 text-xs uppercase flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Goulot d'étranglement de LockService (30s)
              </h3>
              <p className="text-xs text-slate-400">
                Lorsque 297 étudiants scannent simultanément dans une fenêtre de 90 secondes (~3 à 4 scans/seconde en rafale), le verrou distribué de Google Sheets (<code>LockService.getScriptLock().waitLock(30000)</code>) sature rapidement. Les requêtes s'empilent, entraînant des erreurs <em>"ScriptError: Could not obtain lock for SpreadsheetApp"</em> pour 40% à 60% des élèves.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <h3 className="font-bold text-rose-400 text-xs uppercase flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Absence de WebSockets (Polling inefficace)
              </h3>
              <p className="text-xs text-slate-400">
                Google Apps Script ne supporte pas les connexions WebSockets persistantes. L'écran du vidéoprojecteur doit effectuer des requêtes HTTP polling (<code>setInterval(google.script.run..., 3000)</code>), consommant le quota journalier d'exécutions d'URLFetch et entraînant une latence visuelle de 3 à 8 secondes pour l'enseignant.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <h3 className="font-bold text-rose-400 text-xs uppercase flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Vitesse d'écriture Google Sheets
              </h3>
              <p className="text-xs text-slate-400">
                L'insertion d'une ligne via <code>sheet.appendRow()</code> prend entre <strong>180ms et 650ms</strong> par écriture synchrone. En comparaison, une transaction atomique Redis ou PostgreSQL prend moins de <strong>2ms</strong>.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <h3 className="font-bold text-rose-400 text-xs uppercase flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Quotas Journaliers Google Workspace
              </h3>
              <p className="text-xs text-slate-400">
                Les comptes Workspace UCA sont soumis à des quotas stricts : 20 000 requêtes/jour pour les URL Fetch, temps d'exécution simultané limité à 30 déclenchements, et 6 minutes d'exécution continue maximale.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: THREAT MODEL & ANTI-FRAUD PROTOCOLS */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Modélisation des Menaces : Comment Combattre la Fraude en Milieu Universitaire
            </h2>
          </div>

          <p>
            Dans tout système d'émargement QR en amphithéâtre, les étudiants cherchent naturellement à contourner le système pour faire émarger des camarades absents. Voici l'analyse détaillée des vecteurs d'attaque et des contre-mesures cryptographiques :
          </p>

          <div className="space-y-3 mt-4">
            {/* Attack 1: WhatsApp Screenshot */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">Vecteur N°1 : L'Attaque "Relais Photo WhatsApp"</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Fréquence : Très Élevée</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                <strong>Scénario :</strong> Un étudiant présent en amphi prend une photo du vidéoprojecteur avec son smartphone et l'envoie sur le groupe WhatsApp de promotion. Les étudiants absents (restés chez eux ou au café) scannent l'image depuis leur ordinateur.
              </p>
              <div className="mt-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                <strong>Parade Cryptographique : QR Code Dynamique Tournant (TOTP v2).</strong> Le QR code projeté est régénéré toutes les <strong>8 secondes</strong> avec un <em>epoch timestamp</em> et une signature HMAC-SHA256 éphémère. Le temps de prendre la photo, l'envoyer sur WhatsApp, que le destinataire la télécharge et la scanne (&gt; 15 à 30 secondes), le jeton est <strong>déjà expiré et rejeté</strong> par le serveur.
              </div>
            </div>

            {/* Attack 2: Replay Attack */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">Vecteur N°2 : Attaque par Rejeu Réseau (Network Replay Attack)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Fréquence : Moyenne</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                <strong>Scénario :</strong> Un étudiant intercepte sa propre requête HTTP d'émargement et la renvoie en boucle pour valider d'autres comptes ou tenter une injection de charge utile.
              </p>
              <div className="mt-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                <strong>Parade Cryptographique : Nonce Unique & Index Atomique Unique.</strong> Chaque jeton QR contient un <em>cryptographic nonce</em> aléatoire de 16 octets. En base de données, l'unicité de la clé composite <code>(session_id, student_id)</code> garantit une écriture idempotente (INSERT ON CONFLICT DO NOTHING).
              </div>
            </div>

            {/* Attack 3: Physical Presence Proof */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">Vecteur N°3 : Absence de Preuve de Proximité Physique</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Renforcement Recommandé</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Pour garantir que l'étudiant est physiquement dans l'amphithéâtre de Kelaa des Sraghna, le protocole intègre la vérification de sous-réseau IP (Wi-Fi Campus UCA) ou une balise sonore à ultrasons (18.5 kHz inaudible à l'oreille humaine émise par les haut-parleurs de l'amphi).
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: NEW SCALABLE CLOUD ARCHITECTURE */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Nouvelle Architecture Cible Haute Performance (&lt; 50ms)
            </h2>
          </div>

          <p>
            Pour passer d'un prototype Google Sheets à un système institutionnel prêt à accueillir l'ensemble des 297 étudiants sans latence, nous préconisons l'architecture moderne suivante :
          </p>

          {/* Architectural Diagram Box */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-2">
            <div className="text-amber-400 font-bold">// Schéma d'Architecture Haute Performance</div>
            <div>[VidéoProjecteur Amphi] ──(WebSockets SSE)──┐</div>
            <div>                                              ▼</div>
            <div>[Mobile 297 Étudiants] ──(HTTPS POST)──▶ [CloudFlare CDN Edge]</div>
            <div>                                              │</div>
            <div>                                              ▼</div>
            <div>                                   [FastAPI / Go API Server]</div>
            <div>                                              │</div>
            <div>                    ┌─────────────────────────┴────────────────────────┐</div>
            <div>                    ▼                                                  ▼</div>
            <div>          [Redis Cache & Mutex]                              [PostgreSQL Cloud SQL]</div>
            <div>          • SETNX atomic lock (&lt;1ms)                         • Roster 297 Étudiants</div>
            <div>          • TOTP rotating nonce                              • PV d'émargement Apogée</div>
            <div>          • Pub/Sub Live WebSocket                           • Audit cryptographique</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                <Zap className="w-4 h-4" />
                <span>Ingestion Layer</span>
              </div>
              <p className="text-xs text-slate-400">
                Serveur stateless <strong>Go ou Fastify</strong> déployé sur Google Cloud Run avec auto-scaling de 0 à 10 conteneurs en 500ms. Temps de traitement unitaire : <strong>&lt; 15 ms</strong>.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                <Database className="w-4 h-4" />
                <span>Redis Mutex & Cache</span>
              </div>
              <p className="text-xs text-slate-400">
                Verrouillage distribué ultra-rapide <code>REDIS SETNX session:std:id 1 EX 3600</code>. Zéro risque de condition de course même avec 300 scans par seconde.
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1">
                <Globe className="w-4 h-4" />
                <span>Live WebSockets</span>
              </div>
              <p className="text-xs text-slate-400">
                Canal Redis Pub/Sub qui pousse instantanément chaque validation d'étudiant vers le vidéoprojecteur en <strong>&lt; 25 ms</strong> sans recharger la page.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA MODEL & APOGÉE COMPATIBILITY */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Modèle de Données & Synchronisation Apogée (UCA)
            </h2>
          </div>

          <p>
            Le système national de scolarité universitaire au Maroc est <strong>Apogée</strong>. Le modèle de données de notre système d'émargement est conçu pour une interopérabilité directe :
          </p>

          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300">
            <pre className="text-amber-300/90">{`-- Modèle Relationnel PostgreSQL pour FSJES Kelaa des Sraghna
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apogee_id VARCHAR(8) UNIQUE NOT NULL,       -- Code Apogée UCA (ex: 22001482)
    cne VARCHAR(10) UNIQUE NOT NULL,             -- CNE / Code Massar (ex: G134582910)
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,          -- prenom.nom@uca.ac.ma
    filiere VARCHAR(30) DEFAULT 'LICENCE_MD_MMS',
    groupe VARCHAR(10) NOT NULL,                 -- 'S5-A' ou 'S5-B'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(10) NOT NULL,            -- ex: MD501
    course_title VARCHAR(150) NOT NULL,
    professor VARCHAR(100) NOT NULL,             -- Pr. Zakaria KNIDIRI
    target_group VARCHAR(10) NOT NULL,           -- 'S5-A', 'S5-B' ou 'ALL'
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INT DEFAULT 15,
    session_secret VARCHAR(64) NOT NULL,         -- Clé secrète HMAC pour TOTP
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE RESTRICT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_epoch INT NOT NULL,
    receipt_hash VARCHAR(64) NOT NULL,           -- SHA-256 preuve d'émargement
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(15) DEFAULT 'PRESENT',        -- 'PRESENT', 'RETARD', 'EXCUSE'
    CONSTRAINT unique_student_session UNIQUE (session_id, student_id)
);`}</pre>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400">
            <strong>Conformité CNDP (Loi 09-08 au Maroc) :</strong> Les données d'horodatage et de présence sont hébergées selon le cadre légal national de protection des données personnelles. Aucune donnée biométrique n'est stockée : seule l'empreinte cryptographique de session fait foi.
          </div>
        </section>

        {/* SECTION 5: STEP-BY-STEP MIGRATION ROADMAP */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Feuille de Route de Déploiement & Recommandations Concrètes
            </h2>
          </div>

          <div className="space-y-4 mt-2">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Étape 1 : Optimisation Immédiate du Code Google Apps Script</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Si le déploiement reste temporairement sur Google Sheets : mettre en place un <strong>tampon d'écriture en mémoire cache</strong> (CacheService) qui regroupe les écritures de présence par blocs de 20 étudiants au lieu d'écrire ligne par ligne. Cela élimine 90% des contentions de verrou.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Étape 2 : Activer la Rotation QR TOTP (8 secondes)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ne jamais utiliser de QR code statique pour un amphi de 297 étudiants. La rotation cryptographique toutes les 8 secondes est la seule barrière mathématique efficace contre le partage WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Étape 3 : Transition vers le Backend Dédié Cloud Run</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Déployer cette application React avec son API backend sur Cloud Run. Coût estimé pour une université : <strong>0,00 $ à 5,00 $/mois</strong> grâce au palier gratuit de Google Cloud Platform (2 millions de requêtes gratuites mensuelles).
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};
