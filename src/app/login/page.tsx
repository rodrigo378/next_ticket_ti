"use client";

import { Card, Button, Typography, Space, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

const BRAND = "#ec244f";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Logo Microsoft (cuatro cuadrados)
function MicrosoftLogo({ size = 18 }: { size?: number }) {
  const s = size;
  const gap = Math.round(s * 0.11);
  const box = Math.round((s - gap) / 2);
  return (
    <span
      aria-label="Microsoft"
      style={{
        display: "inline-flex",
        width: s,
        height: s,
        gap,
        flexWrap: "wrap",
      }}
    >
      <span style={{ width: box, height: box, background: "#F25022" }} />
      <span style={{ width: box, height: box, background: "#7FBA00" }} />
      <span style={{ width: box, height: box, background: "#00A4EF" }} />
      <span style={{ width: box, height: box, background: "#FFB900" }} />
    </span>
  );
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Si ya hay token, no muestres el login
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) router.push("/");
  }, [router]);

  const handleMicrosoftLogin = () => {
    if (loading) return;
    setLoading(true);

    const current =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    const url = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(
      current || "/"
    )}`;
    window.location.href = url;
  };

  return (
    <div className="page">
      <div className="wrap">
        {/* Columna izquierda: acción */}
        <Card className="card">
          <div className="header">
            <div className="logo">UMA</div>
            <div className="titles">
              <Title level={2} className="title">
                Gestión UMA
              </Title>
              <Text className="subtitle">
                Accede con tu cuenta institucional
              </Text>
            </div>
          </div>

          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <Button
              size="large"
              className="ms-btn"
              onClick={handleMicrosoftLogin}
              icon={!loading ? <MicrosoftLogo size={18} /> : undefined}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <Spin size="small" />
                  Redirigiendo…
                </span>
              ) : (
                "Continuar con Microsoft"
              )}
            </Button>

            <Text className="hint">
              Solo cuentas <b>@uma.edu.pe</b> están permitidas.
            </Text>
          </Space>

          <div className="fineprint">
            <Text type="secondary">
              Al continuar aceptas las políticas de uso del sistema.
            </Text>
          </div>
        </Card>

        {/* Columna derecha: bloque institucional (decoración clara) */}
        <div className="hero" aria-hidden>
          <div className="hero-inner">
            <div className="ribbon" />
            <div className="seal">UMA</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== Lienzo claro institucional ===== */
        .page {
          min-height: 100vh;
          background: radial-gradient(
              1100px 500px at 10% -10%,
              rgba(236, 36, 79, 0.08),
              transparent 60%
            ),
            radial-gradient(
              1000px 520px at 110% 110%,
              rgba(236, 36, 79, 0.06),
              transparent 60%
            ),
            linear-gradient(180deg, #ffffff, #f7f9fc);
          display: grid;
          place-items: center;
          padding: 32px 20px;
        }

        .wrap {
          width: min(1100px, 96vw);
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 28px;
          align-items: stretch;
        }

        @media (max-width: 980px) {
          .wrap {
            grid-template-columns: 1fr;
          }
          .hero {
            display: none;
          }
        }

        /* ===== Card de acceso (claro) ===== */
        .card {
          border-radius: 18px;
          padding: 28px 28px 22px;
          background: #ffffff;
          border: 1px solid #ebeff5;
          box-shadow: 0 14px 28px rgba(16, 24, 40, 0.06),
            0 1px 0 rgba(16, 24, 40, 0.02);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }
        .logo {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: ${BRAND};
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 20px rgba(236, 36, 79, 0.25);
        }
        .title {
          margin: 0;
          color: #0f172a;
          line-height: 1.05;
        }
        .subtitle {
          color: #475569;
        }

        /* Botón Microsoft (estándar claro) */
        .ms-btn {
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .ms-btn:hover {
          border-color: ${BRAND};
          box-shadow: 0 10px 18px rgba(236, 36, 79, 0.12);
          transform: translateY(-1px);
        }
        .ms-btn:disabled {
          opacity: 0.95;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .btn-loading {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .hint {
          color: #64748b;
          font-size: 12px;
        }

        .fineprint {
          margin-top: 8px;
        }

        /* ===== Panel institucional derecho (claro) ===== */
        .hero {
          background: #ffffff;
          border: 1px solid #ebeff5;
          border-radius: 18px;
          box-shadow: 0 14px 28px rgba(16, 24, 40, 0.06),
            0 1px 0 rgba(16, 24, 40, 0.02);
          display: grid;
          place-items: center;
          overflow: hidden;
          position: relative;
        }
        .hero-inner {
          width: 100%;
          height: 100%;
          min-height: 420px;
          position: relative;
          background: linear-gradient(180deg, #fff, #fafcff);
        }
        .ribbon {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 75%;
          height: 160%;
          transform: rotate(18deg);
          background: linear-gradient(
            135deg,
            ${BRAND} 0%,
            rgba(236, 36, 79, 0.85) 40%,
            rgba(236, 36, 79, 0.65) 100%
          );
          opacity: 0.18;
          border-radius: 32px;
          filter: blur(1px);
        }
        .seal {
          position: absolute;
          left: 32px;
          bottom: 24px;
          color: ${BRAND};
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 1.2px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid #ffd6df;
          box-shadow: 0 8px 16px rgba(236, 36, 79, 0.12);
        }
      `}</style>
    </div>
  );
}
