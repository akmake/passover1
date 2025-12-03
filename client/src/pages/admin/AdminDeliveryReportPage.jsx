import { useMemo, useState } from "react";
import api from "@/api";
import { useAllAvailableDates } from "@/hooks/useAllAvailableDates"; // <-- Add this line
import { useQuery } from "@tanstack/react-query";
import {
  LoaderCircle,
  Printer,
  Truck,
  Home,
  Phone,
  User,
  Package,
  MessageSquare,
  MapPin,
  CalendarDays,
  FileText,
  Building,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ----- Helpers (ללא שינוי) -----
const heLocale = (dateLike) =>
  new Date(dateLike).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const safe = (val, fallback = "—") =>
  val === null || val === undefined || val === "" ? fallback : val;

const addressLine = (d) => {
  const parts = [
    safe(d?.streetAddress),
    safe(d?.city),
    d?.floor ? `קומה ${d.floor}` : null,
    d?.apartment ? `דירה ${d.apartment}` : null,
  ].filter(Boolean);
  return parts.join(", ");
};

const sortHeb = (a, b) => a.localeCompare(b, "he");

// ----- Data Fetcher (ללא שינוי) -----
const fetchDeliveryReport = async (deliveryDate) => {
  const { data } = await api.get("/api/admin/reports/delivery", {
    params: { deliveryDate },
    withCredentials: true,
  });
  return data;
};

// ----- קומפוננטות UI משנה (משופרות ומפורקות) -----

// כרטיס KPI
const Kpi = ({ label, value, icon: Icon, color = "text-slate-600" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div className={`rounded-lg bg-opacity-10 p-2 ${color.replace('text', 'bg')}`}>
      {Icon && <Icon className={`h-6 w-6 ${color}`} />}
    </div>
    <div className="flex flex-col">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
  </motion.div>
);

// כותרת סקשן
const SectionTitle = ({ icon: Icon, color = "text-slate-800", children }) => (
  <h2 className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3 text-2xl font-semibold text-slate-800">
    {Icon && <Icon className={`h-6 w-6 ${color}`} />}
    <span>{children}</span>
  </h2>
);

// עטיפה לטבלה
const TableShell = ({ columns, children }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full border-separate border-spacing-0">
      <thead className="bg-slate-50 sticky top-0 print:static">
        <tr>
          {columns.map((c, idx) => (
            <th
              key={idx}
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

// תא בטבלה עם אייקון
const InfoCell = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        <span className="text-slate-700">{children}</span>
    </div>
);

// ----- קומפוננטות תוכן (חדשות) -----

// כותרת הדוח ובחירת תאריך
const ReportHeader = ({ selectedDate, onDateChange, availableDates, isLoadingDates, onPrint, canPrint }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">דוח איסוף ומשלוחים</h1>
            <p className="text-slate-500 mt-1">בחר תאריך להצגת סיכום ההזמנות.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
                <select
                    id="reportDate"
                    value={selectedDate}
                    onChange={onDateChange}
                    className="w-full min-w-[240px] appearance-none rounded-lg border border-slate-300 bg-white p-2 pl-10 pr-4 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={isLoadingDates}
                >
                    <option value="">-- בחר תאריך רלוונטי --</option>
                    {isLoadingDates ? (
                        <option disabled>טוען תאריכים...</option>
                    ) : (
                        availableDates.map((date) => (
                            <option key={date} value={date}>{heLocale(date)}</option>
                        ))
                    )}
                </select>
            </div>
            <button
                onClick={onPrint}
                disabled={!canPrint}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                <Printer className="h-5 w-5" />
                <span>הדפס דוח</span>
            </button>
        </div>
    </div>
);

// הצגת סטטוס הדוח (טעינה, שגיאה, ריק)
const ReportStatus = ({ isFetching, isError, isSelected, hasData }) => {
    if (isFetching) {
        return <div className="flex justify-center p-10"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }
    if (!isSelected) {
        return <div className="py-16 text-center text-slate-500"><Truck className="mx-auto h-12 w-12 text-slate-400" /><p className="mt-4">אנא בחר תאריך כדי להציג את הדוח.</p></div>;
    }
    if (isError) {
        return <div className="py-16 text-center text-red-500 p-8">שגיאה בטעינת הדוח. אנא נסה שוב.</div>;
    }
    if (!hasData) {
        return <div className="py-16 text-center text-slate-500"><FileText className="mx-auto h-12 w-12 text-slate-400" /><p className="mt-4">לא נמצאו הזמנות (איסוף או משלוח) עבור התאריך שנבחר.</p></div>;
    }
    return null;
};

// סקשן איסוף עצמי
const PickupsSection = ({ pickups }) => (
  <section className="no-break-inside">
    <SectionTitle icon={MapPin} color="text-green-600">
      איסוף עצמי ({pickups.length})
    </SectionTitle>
    <TableShell columns={["מס' הזמנה", "לקוח", "טלפון", "נקודת איסוף", "הערות"]}>
      {pickups.map((p) => (
        <tr key={p.orderId} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
          <td className="px-4 py-3 font-mono text-slate-600">#{safe(p.orderId)}</td>
          <td className="px-4 py-3"><InfoCell icon={User}>{safe(p.customerName)}</InfoCell></td>
          <td className="px-4 py-3"><InfoCell icon={Phone}>{safe(p.phone)}</InfoCell></td>
          <td className="px-4 py-3"><InfoCell icon={MapPin}>{safe(p.fulfillmentDetails)}</InfoCell></td>
          <td className="px-4 py-3 text-sm">
            {p.notes ? (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-yellow-800">
                <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>{p.notes}</span>
              </div>
            ) : "—"}
          </td>
        </tr>
      ))}
    </TableShell>
  </section>
);

// סקשן משלוחים
const DeliveriesSection = ({ cities, deliveriesByCity }) => (
  <section>
    <SectionTitle icon={Truck} color="text-blue-600">משלוחים</SectionTitle>
    <div className="space-y-10">
      {cities.map((city, idx) => {
        const deliveries = deliveriesByCity[city] || [];
        return (
          <div key={city} className={`no-break-inside ${idx < cities.length - 1 ? "page-break-after" : ""}`}>
            <h3 className="flex items-center gap-2 text-xl font-semibold bg-slate-100 p-3 rounded-t-lg border border-b-0 border-slate-200">
              <Building className="h-5 w-5 text-slate-500" />
              {city}
              <span className="text-sm font-medium text-slate-600">({deliveries.length} משלוחים)</span>
            </h3>
            <TableShell columns={["מס' הזמנה", "לקוח", "טלפון", "כתובת מלאה", "הערות לשליח"]}>
              {deliveries.map((d) => (
                <tr key={d.orderId} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-600">#{safe(d.orderId)}</td>
                  <td className="px-4 py-3"><InfoCell icon={User}>{safe(d.customerName)}</InfoCell></td>
                  <td className="px-4 py-3"><InfoCell icon={Phone}>{safe(d.phone)}</InfoCell></td>
                  <td className="px-4 py-3"><InfoCell icon={Home}>{addressLine(d)}</InfoCell></td>
                  <td className="px-4 py-3 text-sm">
                    {d.notes ? (
                      <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-yellow-800">
                        <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>{d.notes}</span>
                      </div>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </TableShell>
          </div>
        );
      })}
    </div>
  </section>
);


// ----- קומפוננטת העמוד הראשית (המארגנת) -----
const AdminDeliveryReportPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const { availableDates, isLoading: isLoadingDates } = useAllAvailableDates();

  const { data, isError, isFetching } = useQuery({
    queryKey: ["deliveryReport", selectedDate],
    queryFn: () => fetchDeliveryReport(selectedDate),
    enabled: !!selectedDate,
    refetchOnWindowFocus: false,
  });

  const reportData = data || {};
  const pickups = reportData.pickups ?? [];
  const deliveriesByCityRaw = reportData.deliveries ?? {};

  const citiesSorted = useMemo(() => Object.keys(deliveriesByCityRaw).sort(sortHeb), [deliveriesByCityRaw]);
  const deliveriesCount = useMemo(() => citiesSorted.reduce((sum, city) => sum + (deliveriesByCityRaw[city]?.length || 0), 0), [citiesSorted, deliveriesByCityRaw]);
  const hasData = (pickups.length > 0) || (deliveriesCount > 0);

  const kpis = useMemo(() => ({
    total: pickups.length + deliveriesCount,
    pickupsCount: pickups.length,
    deliveriesCount,
    citiesCount: citiesSorted.length,
  }), [pickups.length, deliveriesCount, citiesSorted.length]);

  return (
    <div dir="rtl" className="space-y-6 bg-slate-50 p-4 sm:p-6 md:p-8 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `@media print { .print\\:hidden { display: none !important; } .page-break-after { page-break-after: always; } .no-break-inside { break-inside: avoid; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }}` }} />

      <ReportHeader
        selectedDate={selectedDate}
        onDateChange={(e) => setSelectedDate(e.target.value)}
        availableDates={availableDates}
        isLoadingDates={isLoadingDates}
        onPrint={() => window.print()}
        canPrint={hasData}
      />
      
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-2xl font-bold">דוח איסוף ומשלוחים</h2>
        <p className="text-base">לתאריך: {selectedDate ? heLocale(selectedDate) : "— לא נבחר —"}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={selectedDate ? (isFetching ? 'loading' : 'data') : 'initial'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <ReportStatus
                isFetching={isFetching}
                isError={isError}
                isSelected={!!selectedDate}
                hasData={hasData}
            />

            {hasData && !isFetching && (
                <div className="space-y-8">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                        <Kpi label="סך הזמנות" value={kpis.total} icon={Package} color="text-indigo-600" />
                        <Kpi label="איסוף עצמי" value={kpis.pickupsCount} icon={MapPin} color="text-green-600" />
                        <Kpi label="משלוחים" value={kpis.deliveriesCount} icon={Truck} color="text-blue-600" />
                        <Kpi label="מס' ערים" value={kpis.citiesCount} icon={Building} color="text-amber-600" />
                    </div>

                    {/* City Summary */}
                    {kpis.deliveriesCount > 0 && (
                        <section className="no-break-inside">
                             <SectionTitle icon={Users} color="text-slate-800">סיכום לפי עיר</SectionTitle>
                             <TableShell columns={["עיר", "מס' משלוחים"]}>
                                {citiesSorted.map((city) => (
                                    <tr key={city} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{city}</td>
                                        <td className="px-4 py-3 text-slate-600">{deliveriesByCityRaw[city]?.length || 0}</td>
                                    </tr>
                                ))}
                             </TableShell>
                        </section>
                    )}

                    {kpis.pickupsCount > 0 && <PickupsSection pickups={pickups} />}
                    {kpis.deliveriesCount > 0 && <DeliveriesSection cities={citiesSorted} deliveriesByCity={deliveriesByCityRaw} />}
                </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDeliveryReportPage;