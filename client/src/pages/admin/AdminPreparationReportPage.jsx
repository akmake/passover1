import { useMemo, useState } from "react";
import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import {
  LoaderCircle,
  Printer,
  FileText,
  Download,
  Filter,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useAllAvailableDates } from "@/hooks/useAllAvailableDates";

/* --------- API --------- */
const fetchPreparationReport = async (deliveryDate) => {
  const { data } = await api.get("/api/admin/reports/preparation", {
    params: { deliveryDate },
    withCredentials: true,
  });
  return data; // צפוי: Array<{ name: string, quantity: number }>
};

/* --------- Helpers --------- */
const heDate = (d) =>
  new Date(d).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const exportCsv = (rows, filename = "preparation-report.csv") => {
  const head = ["שם פריט", "כמות מסוכמת"];
  const body = rows.map((r) => [r.name, r.quantity]);
  const csv =
    [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* --------- KPI --------- */
const Kpi = ({ label, value }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

/* --------- Component --------- */
const AdminPreparationReportPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [q, setQ] = useState("");
  const [minQty, setMinQty] = useState("");
  const [sortBy, setSortBy] = useState("qty"); // 'qty' | 'name'
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'
  const [dense, setDense] = useState(false);

  const { availableDates, isLoading: isLoadingDates } = useAllAvailableDates();

  const { data: reportData, isError, isFetching } = useQuery({
    queryKey: ["preparationReport", selectedDate],
    queryFn: () => fetchPreparationReport(selectedDate),
    enabled: !!selectedDate,
    refetchOnWindowFocus: false,
  });

  const normalized = useMemo(() => {
    const arr = Array.isArray(reportData) ? reportData : [];
    return arr.map((row) => ({
      name: String(row?.name ?? "").trim(),
      quantity: toNumber(row?.quantity),
    }));
  }, [reportData]);

  const filtered = useMemo(() => {
    let rows = normalized;
    if (q.trim()) {
      const t = q.trim();
      rows = rows.filter((r) => r.name.includes(t));
    }
    if (minQty !== "" && !Number.isNaN(Number(minQty))) {
      const mq = Number(minQty);
      rows = rows.filter((r) => r.quantity >= mq);
    }
    rows = [...rows].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = a.name.localeCompare(b.name, "he");
        return sortDir === "asc" ? cmp : -cmp;
      } else {
        const cmp = a.quantity - b.quantity;
        return sortDir === "asc" ? cmp : -cmp;
      }
    });
    return rows;
  }, [normalized, q, minQty, sortBy, sortDir]);

  const totals = useMemo(() => {
    const items = filtered.length;
    const qty = filtered.reduce((s, r) => s + r.quantity, 0);
    const zeroCount = filtered.filter((r) => r.quantity === 0).length;
    return { items, qty, zeroCount };
  }, [filtered]);

  const handlePrint = () => window.print();
  const canExport = filtered.length > 0;

  return (
    <div dir="rtl" className="space-y-6">
      {/* print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          thead { display: table-header-group; }
          .no-break-inside { break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }`,
        }}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <h1 className="text-3xl font-bold">דוח ייצור למטבח</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="reportDate" className="text-sm text-gray-700">
            בחר תאריך משלוח:
          </label>
          <select
            id="reportDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md min-w-[220px]"
            disabled={isLoadingDates}
          >
            <option value="">-- בחר תאריך רלוונטי --</option>
            {isLoadingDates ? (
              <option disabled>טוען תאריכים...</option>
            ) : (
              availableDates.map((date) => (
                <option key={date} value={date}>
                  {heDate(date)}
                </option>
              ))
            )}
          </select>

          <button
            onClick={handlePrint}
            disabled={!filtered.length}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Printer className="h-5 w-5" />
            הדפס דוח
          </button>

          <button
            onClick={() => exportCsv(filtered, `preparation-${selectedDate || "no-date"}.csv`)}
            disabled={!canExport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
          >
            <Download className="h-5 w-5" />
            יצוא CSV
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center">
        <h2 className="text-2xl font-bold">דוח ייצור למטבח</h2>
        <p className="text-base">
          לתאריך משלוח: {selectedDate ? heDate(selectedDate) : "—"}
        </p>
      </div>

      {/* Controls */}
      {selectedDate && !isFetching && !isError && (
        <div className="print:hidden">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="חיפוש לפי שם פריט…"
                    className="pl-9 pr-3 h-10 rounded-md border border-gray-300"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <label className="text-sm text-gray-600">כמות מינימלית:</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="h-10 w-28 rounded-md border border-gray-300 px-3"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">מיון:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 px-2"
                  >
                    <option value="qty">לפי כמות</option>
                    <option value="name">לפי שם</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    className="h-10 rounded-md border border-gray-300 px-3 hover:bg-gray-50"
                    title={sortDir === "asc" ? "סדר עולה" : "סדר יורד"}
                  >
                    {sortDir === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={dense}
                  onChange={(e) => setDense(e.target.checked)}
                />
                צפיפות גבוהה (יותר שורות בעמוד)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* States */}
      {isFetching && (
        <div className="flex justify-center p-8">
          <LoaderCircle className="animate-spin h-8 w-8" />
        </div>
      )}

      {!selectedDate && !isFetching && (
        <div className="text-center py-16 text-gray-500">
          <FileText className="mx-auto h-12 w-12" />
          <p className="mt-4">אנא בחר תאריך כדי להציג את דוח הייצור.</p>
        </div>
      )}

      {isError && !isFetching && (
        <div className="text-center text-red-500 p-8">שגיאה בטעינת הדוח.</div>
      )}

      {/* KPIs */}
      {selectedDate && !isFetching && !isError && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="מס' פריטים" value={totals.items.toLocaleString("he-IL")} />
          <Kpi label="סך כמות" value={totals.qty.toLocaleString("he-IL")} />
          <Kpi label="פריטים בכמות 0" value={totals.zeroCount.toLocaleString("he-IL")} />
          <Kpi
            label="תאריך משלוח"
            value={selectedDate ? heDate(selectedDate) : "—"}
          />
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="no-break-inside rounded-xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">
            סיכום פריטים — {filtered.length.toLocaleString("he-IL")} רשומות
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-100 sticky top-0 print:static">
                <tr>
                  <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700 border-b w-[90px]">
                    #
                  </th>
                  <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700 border-b">
                    שם פריט
                  </th>
                  <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700 border-b w-[160px]">
                    כמות מסוכמת
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={`${row.name}-${i}`}
                    className={i % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td
                      className={`px-4 border-b text-gray-600 ${
                        dense ? "py-1.5" : "py-2.5"
                      }`}
                    >
                      {i + 1}
                    </td>
                    <td
                      className={`px-4 border-b font-medium ${
                        dense ? "py-1.5" : "py-2.5"
                      }`}
                    >
                      {row.name || "—"}
                    </td>
                    <td
                      className={`px-4 border-b font-bold ${
                        dense ? "py-1.5" : "py-2.5"
                      }`}
                    >
                      {row.quantity.toLocaleString("he-IL")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50 font-bold">
                  <td className={`px-4 border-t ${dense ? "py-1.5" : "py-2.5"}`}>
                    —
                  </td>
                  <td className={`px-4 border-t ${dense ? "py-1.5" : "py-2.5"}`}>
                    סה״כ
                  </td>
                  <td
                    className={`px-4 border-t ${dense ? "py-1.5" : "py-2.5"}`}
                  >
                    {totals.qty.toLocaleString("he-IL")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Empty */}
      {selectedDate && !isFetching && !isError && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          לא נמצאו הזמנות עבור התאריך שנבחר.
        </div>
      )}
    </div>
  );
};

export default AdminPreparationReportPage;
