import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";
import type { ReportResult } from "../types";

const ALL = "All";

function formatCell(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    // Keep integers clean; round decimals to 2 places for readability.
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function isMoneyColumn(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("revenue") ||
    n.includes("total") ||
    n.includes("cost") ||
    n.includes("spent") ||
    n.includes("price") ||
    n === "avgordervalue"
  );
}

function renderCell(col: string, value: string | number | boolean | null) {
  const formatted = formatCell(value);
  if (typeof value === "number" && isMoneyColumn(col) && value !== null) {
    return `$${value.toFixed(2)}`;
  }
  return formatted;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [openSql, setOpenSql] = useState<Record<string, boolean>>({});

  function load() {
    setLoading(true);
    api
      .get<ReportResult[]>("/api/reports")
      .then((r) => {
        setReports(r);
        setRefreshedAt(new Date());
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    if (!reports) return [ALL];
    const set = new Set<string>();
    reports.forEach((r) => set.add(r.category));
    return [ALL, ...Array.from(set)];
  }, [reports]);

  const filtered = useMemo(() => {
    if (!reports) return [];
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const catOk = category === ALL || r.category === category;
      const qOk =
        q.length === 0 ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [reports, category, query]);

  const totals = useMemo(() => {
    if (!reports) return { queries: 0, rows: 0, errors: 0 };
    return reports.reduce(
      (acc, r) => ({
        queries: acc.queries + 1,
        rows: acc.rows + r.rowCount,
        errors: acc.errors + (r.error ? 1 : 0),
      }),
      { queries: 0, rows: 0, errors: 0 }
    );
  }, [reports]);

  if (error) {
    return (
      <section>
        <div className="page-header">
          <div>
            <h2>Reports</h2>
            <p className="subtitle muted">
              Something went wrong while running the analysis queries.
            </p>
          </div>
          <div className="page-actions">
            <button className="secondary" onClick={load}>
              <Icon name="refresh" size={14} /> Retry
            </button>
          </div>
        </div>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!reports && loading) return <p className="muted">Running analysis queries…</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p className="subtitle muted">
            Results of all twelve MIS 330 stage-2 analysis queries, executed live against MySQL.
          </p>
        </div>
        <div className="page-actions">
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Last refresh {refreshedAt.toLocaleTimeString()}
          </span>
          <button className="secondary" onClick={load} disabled={loading}>
            <Icon name="refresh" size={14} /> {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "1.25rem" }}>
        <div className="kpi">
          <div className="kpi-icon"><Icon name="chart" /></div>
          <div className="kpi-value">{totals.queries}</div>
          <div className="kpi-label">Queries</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Icon name="receipt" /></div>
          <div className="kpi-value">{totals.rows}</div>
          <div className="kpi-label">Total rows returned</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Icon name="alert" /></div>
          <div className="kpi-value">{totals.errors}</div>
          <div className="kpi-label">Queries with errors</div>
        </div>
      </div>

      <div className="product-toolbar" role="region" aria-label="Report filters">
        <label>
          <Icon name="search" size={14} />
          <input
            type="search"
            placeholder="Search reports…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <span className="count">
          Showing {filtered.length} of {reports?.length ?? 0}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No reports match your filters</h3>
          <p>Try clearing the search box or switching back to the "All" category.</p>
        </div>
      ) : (
        <div className="reports-list">
          {filtered.map((r, idx) => {
            const isOpen = openSql[r.id] ?? false;
            return (
              <article className="report-card" key={r.id}>
                <header className="report-head">
                  <div className="report-title-wrap">
                    <span className="report-number">{String(idx + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="report-title">{r.title}</h3>
                      <p className="report-desc">{r.description}</p>
                    </div>
                  </div>
                  <div className="report-meta">
                    <span className="chip">{r.category}</span>
                    <span className="chip chip-soft">
                      {r.rowCount} {r.rowCount === 1 ? "row" : "rows"}
                    </span>
                  </div>
                </header>

                <details
                  className="report-sql"
                  open={isOpen}
                  onToggle={(e) =>
                    setOpenSql((s) => ({ ...s, [r.id]: (e.target as HTMLDetailsElement).open }))
                  }
                >
                  <summary>View SQL</summary>
                  <pre>
                    <code>{r.sql}</code>
                  </pre>
                </details>

                {r.error ? (
                  <p className="error">Query failed: {r.error}</p>
                ) : r.rowCount === 0 ? (
                  <p className="muted" style={{ padding: "0.5rem 0.25rem" }}>
                    No rows returned.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {r.columns.map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>{renderCell(r.columns[j], cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
