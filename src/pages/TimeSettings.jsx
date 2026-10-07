import React, { useEffect, useMemo, useState } from "react";
import DefaultSelect from "../components/DefaultSelect";
import DefaultInput from "../components/DefaultInput";
import { useCreateTimeSwitchMutation, useGetShiftListQuery, useGetTimeCheckListQuery, useGetTimeSwitchsQuery } from "../features/shift/shiftQuerySlice";
import { FormProvider, useForm } from "react-hook-form";
import { useGetSessionsQuery } from "../features/session/sessionQuerySlice";
import TimePicker from "../components/TimePicker";
import DatePickerOne from "../components/DatePickerOne";
import { showModal } from "../utils/ModalControlar";
import convertBijoyToBengali from "../utils/uniconveter";
import { toast } from 'react-toastify';
/* ------------------------------------------------------------------ *
 * TimeSetting.jsx – "Switchin Setting" MAIN AREA
 * ------------------------------------------------------------------ */

const SHIFTS = ["প্রথম শিফট", "দ্বিতীয় শিফট"];
const SESSIONS = [
  { id: "Regular Session", name: "Regular Session" },
  { id: "Ramadan Session", name: "Ramadan Session" },
];
const SWITCHES = [
  { id: "Check-In", name: "Check-In" },
  { id: "Check-Out", name: "Check-Out" },
  { id: "Break-In", name: "Break-In" },
  { id: "Break-Out", name: "Break-Out" },
];

const ROW_TINT = {
  "Check-In": "bg-emerald-50 dark:bg-emerald-950/30",
  "Check-Out": "bg-violet-50 dark:bg-violet-950/30",
  "Break-In": "bg-amber-50 dark:bg-amber-950/30",
  "Break-Out": "bg-sky-50 dark:bg-sky-950/30",
  "আগমন": "bg-emerald-50 dark:bg-emerald-950/30",
  "প্রস্তান": "bg-violet-50 dark:bg-violet-950/30",
  "বিরতি-আগমন": "bg-amber-50 dark:bg-amber-950/30",
  "বিরতি-প্রস্তান": "bg-sky-50 dark:bg-sky-950/30",
};

const SAMPLE_RULES = [
  { id: 1, shift: SHIFTS[0], sw: "Check-In", start: "07:00:00", late: "19:00:00", end: "19:00:01", active: true },
  { id: 4, shift: SHIFTS[0], sw: "Check-Out", start: "19:00:02", late: "20:00:00", end: "20:00:00", active: true },
  { id: 7, shift: SHIFTS[0], sw: "Break-In", start: "16:00:00", late: "16:30:00", end: "17:00:00", active: true },
  { id: 8, shift: SHIFTS[0], sw: "Break-Out", start: "18:00:00", late: "18:30:00", end: "19:00:00", active: true },
  { id: 5, shift: SHIFTS[1], sw: "Check-In", start: "11:00:00", late: "12:00:00", end: "12:20:00", active: true },
  { id: 6, shift: SHIFTS[1], sw: "Check-Out", start: "13:00:00", late: "15:00:00", end: "15:00:00", active: true },
];

const SAMPLE_EMPLOYEES = [
  { id: "250012", name: "মোঃ আব্দুল্লাহ আল মামুন", dept: "হিসাব", desig: "সুপারভাইজার", shift: "" },
  { id: "250015", name: "সানিয়া ইসলাম", dept: "মানব সম্পদ", desig: "কর্মচারী", shift: "" },
  { id: "250017", name: "রাশেদুল ইসলাম", dept: "হিসাব", desig: "অফিস সহকারী", shift: "" },
  { id: "250025", name: "তানভীর আহমেদ", dept: "মানব সম্পদ", desig: "অফিস সহায়ক", shift: SHIFTS[1] },
  { id: "250028", name: "সাইফ উদ্দিন", dept: "সেলস", desig: "টিম লিড", shift: SHIFTS[1] },
  { id: "250035", name: "মুসারাত জাহান", dept: "মানব সম্পদ", desig: "অফিস সহকারী", shift: SHIFTS[1] },
  { id: "250101", name: "নুরুল ইসলাম", dept: "আইটি", desig: "সহকারী প্রোগ্রামার", shift: SHIFTS[0] },
  { id: "250102", name: "রাকিব হাসান", dept: "হিসাব", desig: "কর্মচারী", shift: SHIFTS[0] },
  { id: "250103", name: "ফারহানা আক্তার", dept: "মানব সম্পদ", desig: "সিনিয়র অফিসার", shift: SHIFTS[0] },
  { id: "250104", name: "শামীমা রহমান", dept: "সেলস", desig: "কর্মচারী", shift: SHIFTS[0] },
  { id: "250105", name: "জাহিদুল ইসলাম", dept: "অপারেশন", desig: "টিম লিড", shift: SHIFTS[0] },
  { id: "250106", name: "রেহানা বেগম", dept: "হিসাব", desig: "অফিস সহকারী", shift: SHIFTS[0] },
];

const toSec = (t) => {
  if (!t || typeof t !== "string") return 0;
  const [h, m, s] = t.split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
};

const getSeconds = (t) => {
  if (!t) return 0;
  if (typeof t === "string" && t.includes("T")) {
    const d = new Date(t);
    return isNaN(d.getTime()) ? 0 : d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
  }
  return toSec(t);
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  if (typeof timeStr === "string" && !timeStr.includes("T")) return timeStr;
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return String(timeStr);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${String(h12).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
};

const parseTimeString = (timeValue) => {
  if (!timeValue) return null;
  if (typeof timeValue === "string") {
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      return new Date(2000, 0, 1, hours, minutes, seconds);
    }
    const [h = 0, m = 0, s = 0] = timeValue.split(":").map(Number);
    return new Date(2000, 0, 1, h, m, s);
  }
  return timeValue instanceof Date ? timeValue : null;
};

const withSeconds = (t) => (t && t.length === 5 ? t + ":00" : t);

const formatTimeForSql = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}.0000000`;
};

const card = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const btnBlue = "inline-flex items-center justify-center gap-2 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay disabled:cursor-not-allowed disabled:opacity-40";
const btnLine = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
const th = "whitespace-nowrap px-3 pt-2 pb-1 text-left text-[16px] font-semibold text-slate-600 dark:text-slate-400 ";
const td = "whitespace-nowrap px-3 py-2";

export default function TimeSetting() {
  const [rules, setRules] = useState(SAMPLE_RULES);
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES);
  const [activeShift, setActiveShift] = useState("");
  const [activeStatus, setActiveStatus] = useState({});
  const [autoOn, setAutoOn] = useState(true);
  const [editId, setEditId] = useState(null);

  // ---- React Hook Form – Auto Switch Setting ----
  const switchMethods = useForm({
    defaultValues: {
      shiftId: "",
      switchType: "",
      sessionName: "",
      dateFrom: "",
      dateTo: "",
      startTime: "",
      lateTime: "",
      endTime: "",
    },
  });
  const { handleSubmit: handleSwitchSubmit, reset: resetSwitch, setValue: setSwitchValue } = switchMethods;

  const { data: shiftList } = useGetShiftListQuery();
  const { data: timeCheckList } = useGetTimeCheckListQuery();
  const { data: timeSwitchList, isLoading: isTimeSwitchLoading } = useGetTimeSwitchsQuery();

  const displayShifts = timeSwitchList && timeSwitchList.length > 0 ? timeSwitchList : [];

  const effectiveShift = useMemo(() => {
    if (activeShift && displayShifts.some((s) => (s.ShiftNameBangla || s.ShiftNameEnglish) === activeShift || s.ID === activeShift)) {
      return activeShift;
    }
    if (displayShifts.length > 0) {
      return displayShifts[0].ShiftNameBangla || displayShifts[0].ShiftNameEnglish;
    }
    return activeShift || SHIFTS[0];
  }, [activeShift, displayShifts]);

  const availableShifts = useMemo(() => {
    if (timeSwitchList && timeSwitchList.length > 0) {
      return timeSwitchList.map((s) => s.ShiftNameBangla || s.ShiftNameEnglish);
    }
    return SHIFTS;
  }, [timeSwitchList]);

  const {
    data: sessionList,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useGetSessionsQuery();

  const [createTimeSwitch, { isLoading, error }] = useCreateTimeSwitchMutation

  const shiftOptions = shiftList ?? [];
  const timeCheckOptions = timeCheckList ?? [];

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const onReset = () => { setEditId(null); resetSwitch(); };

  const onEdit = (r) => {
    setEditId(r.ID || r.id);
    if (r.ShiftID !== undefined) setSwitchValue("shiftId", r.ShiftID);
    else if (r.shiftId !== undefined) setSwitchValue("shiftId", r.shiftId);
    else if (r.shift !== undefined) setSwitchValue("shiftId", r.shift);

    if (r.CheckTypeID !== undefined) setSwitchValue("switchType", r.CheckTypeID);
    else if (r.switchType !== undefined) setSwitchValue("switchType", r.switchType);
    else if (r.sw !== undefined) setSwitchValue("switchType", r.sw);

    setSwitchValue("startTime", parseTimeString(r.StartTime) || r.start);
    setSwitchValue("lateTime", parseTimeString(r.StartLate) || r.late);
    setSwitchValue("endTime", parseTimeString(r.EndTime) || r.end);
  };

  const onDelete = (id) => {
    // TODO: DELETE /api/switch-rules/:id
    if (window.confirm("Delete rule #" + id + "?")) {
      notify("মুছে ফেলা হয়েছে #" + id);
    }
  };

  const toggleActive = (id) => {
    setActiveStatus((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false,
    }));
  };

  const onSave = async (data) => {
    if (!data.startTime || !data.lateTime || !data.endTime) return notify("সব সময় পূরণ করুন");
    const ruleData = {
      ShiftID: Number(data.shiftId),
      CheckTypeID: Number(data.switchType),
      StartTime: formatTimeForSql(data.startTime),
      StartLate: formatTimeForSql(data.lateTime),
      EndTime: formatTimeForSql(data.endTime),
    };

    // console.log(ruleData);

    try {
      await createTimeSwitch(ruleData).unwrap();
      toast.success('Shift Time Switch created successfully!', {
        progressStyle: {
          background: '#C9724F',
        },
      });
    } catch (error) {
      toast.error(
        error?.data?.message || 'Failed to add student. Please try again.'
      );
    }



    // TODO: POST / PUT /api/switch-rules (also send data.dateFrom, data.dateTo, data.sessionName)
    // if (editId) {
    //   setRules(rules.map((r) => (r.id === editId ? { ...r, ...ruleData } : r)));
    // } else {
    //   setRules([...rules, { id: Math.max(0, ...rules.map((r) => r.id)) + 1, active: true, ...ruleData }]);
    // }
    // onReset();
    // notify("সংরক্ষণ হয়েছে");
  };

  const openShiftEntryModal = () => {
    showModal('নতুন শিফট নিবন্ধন', 'SHIFT_ENTRY');
  };

  // ---- Transfer list state ----
  const [pickL, setPickL] = useState(new Set());
  const [pickR, setPickR] = useState(new Set());
  const [qL, setQL] = useState("");
  const [qR, setQR] = useState("");
  const [deptL, setDeptL] = useState("");
  const [deptR, setDeptR] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);

  const depts = useMemo(() => [...new Set(employees.map((e) => e.dept))], [employees]);
  const match = (e, q, dept) =>
    (!dept || e.dept === dept) && (!q || (e.id + e.name + e.dept).toLowerCase().includes(q.trim().toLowerCase()));

  const left = employees.filter((e) => e.shift !== activeShift && (!onlyFree || !e.shift) && match(e, qL, deptL));
  const right = employees.filter((e) => e.shift === activeShift && match(e, qR, deptR));
  const freeCount = employees.filter((e) => !e.shift).length;

  const moveTo = (ids, shift) => {
    // TODO: POST /api/user-shift
    setEmployees(employees.map((e) => (ids.has(e.id) ? { ...e, shift } : e)));
    setPickL(new Set());
    setPickR(new Set());
  };
  const idsOf = (rows) => new Set(rows.map((e) => e.id));

  // ---- Summary bar values ----
  const currentShiftData = useMemo(() => {
    return timeSwitchList?.find(
      (s) => (s.ShiftNameBangla || s.ShiftNameEnglish) === activeShift || s.ID === activeShift
    );
  }, [timeSwitchList, activeShift]);

  const currentSwitches = currentShiftData?.TimeSwitches || [];
  const sStart = currentSwitches.length
    ? formatTime(
      currentSwitches.reduce((a, r) =>
        getSeconds(r.StartTime) < getSeconds(a.StartTime) ? r : a
      ).StartTime
    )
    : "—";
  const sEnd = currentSwitches.length
    ? formatTime(
      currentSwitches.reduce((a, r) =>
        getSeconds(r.EndTime) > getSeconds(a.EndTime) ? r : a
      ).EndTime
    )
    : "—";
  const hours =
    currentSwitches.length && sStart !== "—" && sEnd !== "—"
      ? Math.round(
        (getSeconds(
          currentSwitches.reduce((a, r) =>
            getSeconds(r.EndTime) > getSeconds(a.EndTime) ? r : a
          ).EndTime
        ) -
          getSeconds(
            currentSwitches.reduce((a, r) =>
              getSeconds(r.StartTime) < getSeconds(a.StartTime) ? r : a
            ).StartTime
          )) /
        3600
      )
      : null;

  return (
    <div className="min-h-screen space-y-4 bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-clay text-xl text-white">⚙</div>
        <div>
          <h1 className="text-xl font-semibold">Switchin Setting</h1>
          <p className="text-[16px] lg:text-[18px] text-slate-500 dark:text-slate-400">
            শিফটের সময়সূচি, সেশন এবং অটো সুইচ সেটিংস এখানে পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid gap-4 xl:grid-cols-[5fr_6fr]">

        {/* --- Form 1: Auto Switch Setting --- */}
        <FormProvider {...switchMethods}>
          <form onSubmit={handleSwitchSubmit(onSave)} className="space-y-4">
            <section className={card}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-[16px]">
                  ⚙ অটো সুইচ সেটিং{" "}
                  {editId && <span className="text-sm font-normal text-slate-500">(সম্পাদনা #{editId})</span>}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* শিফটের নাম */}
                <div>
                  <DefaultSelect
                    label="শিফটের নাম"
                    require="শিফটের নাম নির্বাচন করুন"
                    registerKey="shiftId"
                    options={shiftOptions}
                    valueField="ID"
                    nameField="ShiftNameBangla"
                    defaultValue="শিফট নির্বাচন করুন"
                  />
                </div>

                {/* সুইচের ধরন */}
                <div>
                  <DefaultSelect
                    label="সুইচের ধরন"
                    require="সুইচের ধরন নির্বাচন করুন"
                    registerKey="switchType"
                    options={timeCheckOptions}
                    valueField="ID"
                    nameField="TypeNameBangla"
                    defaultValue="ধরন নির্বাচন করুন"
                  />
                </div>

                {/* সেশন নাম */}
                <div>
                  <DefaultSelect
                    label="সেশন নাম"
                    require="সেশন নির্বাচন করুন"
                    registerKey="SessionID"
                    options={sessionList ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    defaultValue="সেশন নির্বাচন করুন"
                  />
                </div>

                {/* শিফট শুরু তারিখ */}
                <div>
                  <label
                    htmlFor={"dateFrom"}
                    className={`font-bold text-sm`}
                  >
                    <div className="flex items-center gap-1">
                      <span>শিফট শুরু তারিখ</span>
                      <span className="text-red-500">*</span>
                      <span>:</span>
                    </div>
                  </label>
                  <DatePickerOne require={false} registerKey={`dateFrom`} placeholder={"Date"} timestamp={false} />

                  {/* <DefaultInput
                    label="শিফট শুরু তারিখ"
                    type="date"
                    registerKey="dateFrom"
                    placeholder=""
                  /> */}
                </div>

                {/* শিফট শেষ তারিখ */}
                <div>

                  <label
                    htmlFor={"dateFrom"}
                    className={`font-bold text-sm`}
                  >
                    <div className="flex items-center gap-1">
                      <span>শিফট শেষ তারিখ</span>
                      <span className="text-red-500">*</span>
                      <span>:</span>
                    </div>
                  </label>

                  {/* <DefaultInput
                    label="শিফট শেষ তারিখ"
                    type="date"
                    registerKey="dateTo"
                    placeholder=""
                  /> */}
                  <DatePickerOne require={false} registerKey={`dateTo`} placeholder={"Date"} timestamp={false} />
                </div>

                {/* শুরুর সময় */}
                <div>
                  <TimePicker
                    timeCalender={"শুরুর সময়"}
                    placeholder={`শুরুর সময়`}
                    registerKey={`startTime`}
                    require={"শুরুর সময়"}

                  />
                  {/* <DefaultInput
                    label="শুরুর সময়"
                    type="time"
                    registerKey="startTime"
                    require={true}
                    placeholder=""
                  /> */}
                </div>

                {/* লেট শুরু */}
                <div>
                  <TimePicker
                    timeCalender={"লেট শুরু"}
                    placeholder={`লেট শুরু`}
                    registerKey={`lateTime`}
                    require={"লেট শুরু"}
                  />
                </div>

                {/* শেষ সময় */}
                <div>
                  <TimePicker
                    timeCalender={"শেষ সময়"}
                    placeholder={`শেষ সময়`}
                    registerKey={`endTime`}
                    require={"শেষ সময়"}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button type="button" className={btnLine} onClick={onReset}>↻ রিসেট</button>
                <button type="submit" className={btnBlue}>💾 সংরক্ষণ করুন</button>
              </div>
            </section>
          </form>
        </FormProvider>

        {/* Shift list – grouped by shift */}
        <section className={card}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">📅 শিফট তালিকা</h2>
            <button type="button" className={btnBlue} onClick={openShiftEntryModal}>＋ নতুন শিফট যোগ করুন</button>
          </div>
          <div className="overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <table className="w-full text-sm border-x border-t border-neutral-300">
              <thead>
                <tr>
                  {["ক্রমিক", "সুইচ", "শুরু সময়", "লেট", "শেষ সময়", "অ্যাকশন"].map((h) => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isTimeSwitchLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : displayShifts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                      কোনো শিফট বা সুইচ পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  displayShifts.map((shift) => {
                    const shiftName = shift.ShiftNameBangla || shift.ShiftNameEnglish || `শিফট #${shift.ID}`;
                    const rows = shift.TimeSwitches || [];
                    const isSelected = activeShift === shiftName || activeShift === shift.ID;

                    return (
                      <React.Fragment key={shift.ID || shiftName}>
                        <tr>
                          <td colSpan={7} className="px-2 py-3">
                            <div
                              className={"flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left text-[16px] font-semibold transition-colors bg-neutral-400 text-white"}>
                              <span>{shiftName}</span>
                              <span className="text-[14px] font-normal opacity-80">{convertBijoyToBengali(rows.length)} জন শিক্ষার্থী</span>
                            </div>
                          </td>
                        </tr>
                        {rows.map((r, index) => {
                          const typeEng = r.CheckType?.TypeNameEnglish || "";
                          const typeBan = r.CheckType?.TypeNameBangla || "";

                          return (
                            <tr key={r.ID || index} className={"border-b border-neutral-300"}>
                              <td className={td}>
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/80 text-xs font-medium dark:bg-slate-700">
                                  {index + 1}
                                </span>
                              </td>
                              <td className={td + " font-medium"}>
                                <div>
                                  <span>{typeBan || typeEng || "—"}</span>
                                  {typeBan && typeEng && (
                                    <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                                      ({typeEng})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className={td + " tabular-nums"}>{formatTime(r.StartTime)}</td>
                              <td className={td + " tabular-nums"}>{formatTime(r.StartLate)}</td>
                              <td className={td + " tabular-nums"}>{formatTime(r.EndTime)}</td>

                              <td className={td}>
                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() => onEdit(r)}
                                  className="rounded px-2 py-1 text-blue-600 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() => onDelete(r.ID)}
                                  className="rounded px-2 py-1 text-red-500 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  🗑
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-3 py-3 text-center text-slate-500">
                              এই শিফটে কোনো শিক্ষার্থী নেই।
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Row 2: Employee transfer list */}
      <section className={card}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">👥 কর্মচারী নির্বাচন করুন</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">শিফট:</span>
            <select
              className={input + " !w-auto"}
              value={activeShift}
              onChange={(e) => { setActiveShift(e.target.value); setPickL(new Set()); setPickR(new Set()); }}
            >
              {availableShifts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Panel
            title="উপলব্ধ কর্মচারী" note="(শিফটে যোগ করার জন্য)"
            rows={left} picked={pickL} setPicked={setPickL}
            q={qL} setQ={setQL} dept={deptL} setDept={setDeptL}
            depts={depts} showShift total={left.length}
            extra={
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />
                শুধু অ্যাসাইন হয়নি ({freeCount})
              </label>
            }
          />
          <div className="flex flex-row justify-center gap-2 lg:flex-col lg:justify-center">
            <MoveBtn label="নির্বাচিত যোগ করুন" icon="→" disabled={!pickL.size} onClick={() => moveTo(pickL, activeShift)} />
            <MoveBtn label="সব যোগ করুন" icon="⇒" disabled={!left.length} onClick={() => moveTo(idsOf(left), activeShift)} />
            <MoveBtn label="নির্বাচিত অপসারণ" icon="←" disabled={!pickR.size} onClick={() => moveTo(pickR, "")} />
            <MoveBtn label="সব অপসারণ" icon="⇐" disabled={!right.length} onClick={() => moveTo(idsOf(right), "")} />
          </div>
          <Panel
            title="নির্বাচিত কর্মচারী" note={"(" + activeShift + " থাকবেন)"}
            rows={right} picked={pickR} setPicked={setPickR}
            q={qR} setQ={setQR} dept={deptR} setDept={setDeptR}
            depts={depts} total={right.length}
          />
        </div>
      </section>

      {/* Row 3: Summary bar */}
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold">🗓 সেশন সংক্ষিপ্ত বিবরণ</h2>
        <div className="flex flex-wrap items-stretch gap-3">
          <Stat label="বর্তমান শিফট">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{activeShift || "—"}</span>
          </Stat>
          <Stat label="শুরু সময়">{sStart}</Stat>
          <Stat label="শেষ সময়">{sEnd}</Stat>
          <Stat label="মোট সময়">{hours === null ? "—" : hours + " ঘন্টা"}</Stat>
          <Stat label="বর্তমান অবস্থা">
            <span className={autoOn ? "text-emerald-600" : "text-slate-500"}>● {autoOn ? "চালু" : "বন্ধ"}</span>
          </Stat>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button className={btnBlue} onClick={() => { setAutoOn(!autoOn); notify(autoOn ? "অটো সুইচ বন্ধ" : "অটো সুইচ চালু"); }}>↻ অটো সুইচ</button>
            <button className={btnLine} onClick={() => currentSwitches[0] && onEdit(currentSwitches[0])}>✎ সম্পাদনা</button>
            <button className={btnLine} onClick={() => window.print()}>🖨 প্রিন্ট</button>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}

/* ---------- small pieces ---------- */
function Stat({ label, children }) {
  return (
    <div className="min-w-[120px] rounded-lg border border-slate-200 px-4 py-2 dark:border-slate-700">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{children}</div>
    </div>
  );
}

function MoveBtn({ label, icon, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex w-28 flex-col items-center rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </button>
  );
}

function Panel({ title, note, rows, picked, setPicked, q, setQ, dept, setDept, depts, showShift, total, extra }) {
  const allOn = rows.length > 0 && rows.every((e) => picked.has(e.id));
  const toggle = (id) => { const n = new Set(picked); n.has(id) ? n.delete(id) : n.add(id); setPicked(n); };
  const toggleAll = () => { const n = new Set(picked); rows.forEach((e) => (allOn ? n.delete(e.id) : n.add(e.id))); setPicked(n); };
  const cols = ["ক্রমিক", "আইডি", "কর্মচারীর নাম", "বিভাগ", "পদবি", ...(showShift ? ["শিফট"] : [])];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <h3 className="mb-2 text-sm font-semibold">{title} <span className="font-normal text-slate-500">{note}</span></h3>
      <div className="mb-2 flex gap-2">
        <input className={input} placeholder="কর্মচারীর নাম, আইডি বা বিভাগ দিয়ে খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={input + " !w-40"} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">সকল বিভাগ</option>
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      {extra && <div className="mb-2">{extra}</div>}
      <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className={th}><input type="checkbox" checked={allOn} onChange={toggleAll} /></th>
              {cols.map((c) => <th key={c} className={th}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((e, i) => (
              <tr key={e.id} className="border-t border-slate-100 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <td className={td}><input type="checkbox" checked={picked.has(e.id)} onChange={() => toggle(e.id)} /></td>
                <td className={td}>{i + 1}</td>
                <td className={td + " tabular-nums"}>{e.id}</td>
                <td className={td}>{e.name}</td>
                <td className={td}>{e.dept}</td>
                <td className={td}>{e.desig}</td>
                {showShift && (
                  <td className={td}>
                    {e.shift || (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">অ্যাসাইন হয়নি</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-slate-500">কোনো কর্মচারী পাওয়া যায়নি।</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span>মোট রেকর্ড: {total}</span>
        <span>নির্বাচিত: {picked.size}</span>
      </div>
    </div>
  );
}
