import React, { useState } from "react";
import DefaultSelect from "../components/DefaultSelect";
import {
  useAssignTimeShiftMutation,
  useCreateTimeSwitchMutation,
  useDeleteTimeSwitchMutation,
  useGetShiftListQuery,
  useGetTimeCheckListQuery,
  useGetTimeShiftAssignmentOptionsQuery,
  useGetTimeShiftAssignmentsQuery,
  useGetTimeSwitchsQuery,
  useRemoveTimeShiftAssignmentMutation,
  useUpdateTimeSwitchMutation,
} from "../features/shift/shiftQuerySlice";
import { FormProvider, useForm } from "react-hook-form";
import { useGetSessionsQuery } from "../features/session/sessionQuerySlice";
import TimePicker from "../components/TimePicker";
import DatePickerOne from "../components/DatePickerOne";
import { showModal } from "../utils/ModalControlar";
import convertBijoyToBengali from "../utils/uniconveter";
import { toast } from 'react-toastify';
/* ------------------------------------------------------------------ *
 * শিক্ষার্থী সময় সেটিংস
 * ------------------------------------------------------------------ */

const formatTime = (timeStr) => {
  if (!timeStr) return "—";

  let hours;
  let minutes;
  let seconds;

  if (typeof timeStr === "string" && !timeStr.includes("T")) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return String(timeStr);
    hours = Number(match[1]);
    minutes = match[2];
    seconds = match[3] || "00";
  } else {
    const date = timeStr instanceof Date ? timeStr : new Date(timeStr);
    if (isNaN(date.getTime())) return String(timeStr);
    hours = date.getUTCHours();
    minutes = String(date.getUTCMinutes()).padStart(2, "0");
    seconds = String(date.getUTCSeconds()).padStart(2, "0");
  }

  const h12 = hours % 12 || 12;
  const period = hours >= 12 ? "অপরাহ্ণ" : "পূর্বাহ্ণ";
  const time = `${String(h12).padStart(2, "0")}:${minutes}:${seconds}`;
  return `${convertBijoyToBengali(time)} ${period}`;
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

const formatTimeForSql = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}.0000000`;
};

const card = "min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const btnBlue = "inline-flex items-center justify-center gap-2 rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay disabled:cursor-not-allowed disabled:opacity-40";
const btnLine = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
const th = "whitespace-nowrap px-3 pt-2 pb-1 text-left text-[16px] font-semibold text-slate-600 dark:text-slate-400 ";
const td = "whitespace-nowrap px-3 py-2";

export default function TimeSetting() {
  const [activeShift, setActiveShift] = useState("");
  const [editId, setEditId] = useState(null);

  // ---- React Hook Form – Auto Switch Setting ----
  const switchMethods = useForm({
    defaultValues: {
      shiftId: "",
      switchType: "",
      SessionID: "",
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

  const { data: sessionList } = useGetSessionsQuery();

  const [createTimeSwitch, { isLoading: isCreating }] = useCreateTimeSwitchMutation();
  const [updateTimeSwitch, { isLoading: isUpdating }] = useUpdateTimeSwitchMutation();
  const [deleteTimeSwitch, { isLoading: isDeleting }] = useDeleteTimeSwitchMutation();
  const { data: assignmentOptions } = useGetTimeShiftAssignmentOptionsQuery();
  const [assignmentSessionId, setAssignmentSessionId] = useState("");
  const [assignmentSubClassId, setAssignmentSubClassId] = useState("");
  const [assignmentShiftId, setAssignmentShiftId] = useState("");
  const assignmentFiltersReady = Boolean(
    assignmentSessionId && assignmentSubClassId && assignmentShiftId,
  );
  const {
    data: assignmentData,
    isFetching: isAssignmentLoading,
    isError: isAssignmentError,
  } = useGetTimeShiftAssignmentsQuery(
    {
      SessionID: assignmentSessionId,
      SubClassID: assignmentSubClassId,
      ShiftID: assignmentShiftId,
    },
    { skip: !assignmentFiltersReady },
  );
  const [assignTimeShift, { isLoading: isAssigning }] = useAssignTimeShiftMutation();
  const [removeTimeShiftAssignment, { isLoading: isRemovingAssignment }] =
    useRemoveTimeShiftAssignmentMutation();

  const shiftOptions = shiftList ?? [];
  const timeCheckOptions = timeCheckList ?? [];

  const notify = (message) => toast.info(message);

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

  const getApiError = (requestError, fallback) =>
    requestError?.data?.error || requestError?.data?.message || fallback;

  const onDelete = async (id) => {
    if (!window.confirm(`সুইচ সেটিং #${convertBijoyToBengali(id)} মুছে ফেলবেন?`)) return;

    try {
      await deleteTimeSwitch(id).unwrap();
      if (editId === id) onReset();
      toast.success("সুইচ সেটিং সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (requestError) {
      toast.error(getApiError(requestError, "সুইচ সেটিং মুছে ফেলা যায়নি।"));
    }
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

    try {
      if (editId) {
        await updateTimeSwitch({ id: editId, ...ruleData }).unwrap();
      } else {
        await createTimeSwitch(ruleData).unwrap();
      }
      toast.success(editId ? 'সুইচ সেটিং সফলভাবে হালনাগাদ হয়েছে।' : 'সুইচ সেটিং সফলভাবে তৈরি হয়েছে।', {
        progressStyle: {
          background: '#C9724F',
        },
      });
      onReset();
    } catch (requestError) {
      toast.error(getApiError(
        requestError,
        editId ? 'সুইচ সেটিং হালনাগাদ করা যায়নি।' : 'সুইচ সেটিং তৈরি করা যায়নি।',
      ));
    }
  };

  const openShiftEntryModal = () => {
    showModal('নতুন শিফট নিবন্ধন', 'SHIFT_ENTRY');
  };

  // ---- Transfer list state ----
  const [pickL, setPickL] = useState(new Set());
  const [pickR, setPickR] = useState(new Set());
  const [qL, setQL] = useState("");
  const [qR, setQR] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);

  const matchesUser = (employee, query) => {
    if (!query.trim()) return true;
    const searchable = [employee.id, employee.code, employee.name, employee.shiftName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchable.includes(query.trim().toLowerCase());
  };

  const availableUsers = assignmentData?.available ?? [];
  const assignedUsers = assignmentData?.assigned ?? [];
  const left = availableUsers.filter(
    (employee) =>
      (!onlyFree || !employee.shiftId) && matchesUser(employee, qL),
  );
  const right = assignedUsers.filter((employee) => matchesUser(employee, qR));
  const freeCount = availableUsers.filter((employee) => !employee.shiftId).length;
  const isMovingAssignment = isAssigning || isRemovingAssignment;

  const moveSelectedUsers = async (direction) => {
    const selected = direction === "assign" ? pickL : pickR;
    if (!assignmentFiltersReady || selected.size === 0) return;

    const payload = {
      UserIDs: Array.from(selected),
      ShiftID: Number(assignmentShiftId),
      SessionID: Number(assignmentSessionId),
      SubClassID: Number(assignmentSubClassId),
    };

    if (direction === "assign") {
      const usersChangingShift = availableUsers.filter(
        (employee) => selected.has(employee.id) && employee.shiftId,
      ).length;
      if (
        usersChangingShift > 0 &&
        !window.confirm(
          `নির্বাচিত ${convertBijoyToBengali(usersChangingShift)} জন শিক্ষার্থীর অন্য শিফট রয়েছে। তাদের ${activeShift} শিফটে স্থানান্তর করবেন?`,
        )
      ) {
        return;
      }
    }

    try {
      if (direction === "assign") await assignTimeShift(payload).unwrap();
      else await removeTimeShiftAssignment(payload).unwrap();
      setPickL(new Set());
      setPickR(new Set());
      toast.success(
        direction === "assign"
          ? `${convertBijoyToBengali(selected.size)} জন শিক্ষার্থীকে শিফটে যোগ করা হয়েছে।`
          : `${convertBijoyToBengali(selected.size)} জন শিক্ষার্থীকে শিফট থেকে সরানো হয়েছে।`,
      );
    } catch (requestError) {
      toast.error(getApiError(requestError, "শিক্ষার্থীর শিফট হালনাগাদ করা যায়নি।"));
    }
  };

  return (
    <div className="min-h-full w-full min-w-0 space-y-4 overflow-x-hidden bg-slate-100 p-3 text-slate-900 sm:p-4 dark:bg-slate-950 dark:text-slate-100">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-clay text-xl text-white">⚙</div>
        <div>
          <h1 className="text-xl font-semibold">শিক্ষার্থী সময় সেটিংস</h1>
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
                  {editId && <span className="text-sm font-normal text-slate-500">(সম্পাদনা #{convertBijoyToBengali(editId)})</span>}
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

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className={btnLine} onClick={onReset}>↻ রিসেট</button>
                <button type="submit" className={btnBlue} disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? "সংরক্ষণ হচ্ছে..." : "💾 সংরক্ষণ করুন"}
                </button>
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
                    const shiftName = shift.ShiftNameBangla || shift.ShiftNameEnglish || `শিফট #${convertBijoyToBengali(shift.ID)}`;
                    const rows = shift.TimeSwitches || [];
                    return (
                      <React.Fragment key={shift.ID || shiftName}>
                        <tr>
                          <td colSpan={7} className="px-2 py-3">
                            <div
                              className={"flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left text-[16px] font-semibold transition-colors bg-neutral-400 text-white"}>
                              <span>{shiftName}</span>
                              <span className="text-[14px] font-normal opacity-80">{convertBijoyToBengali(rows.length)} টি সুইচ</span>
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
                                  {convertBijoyToBengali(index + 1)}
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
                                  title="সম্পাদনা"
                                  onClick={() => onEdit(r)}
                                  className="rounded px-2 py-1 text-blue-600 hover:bg-white dark:hover:bg-slate-700"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  title="মুছে ফেলুন"
                                  onClick={() => onDelete(r.ID)}
                                  disabled={isDeleting}
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
                              এই শিফটে কোনো সুইচ সেটিং নেই।
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

      {/* Row 2: Student transfer list */}
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">👥 শিক্ষার্থী নির্বাচন করুন</h2>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium">
            <span className="mb-1 block">সেশন <span className="text-red-500">*</span></span>
            <select
              className={input}
              value={assignmentSessionId}
              onChange={(event) => {
                setAssignmentSessionId(event.target.value);
                setPickL(new Set());
                setPickR(new Set());
              }}
            >
              <option value="">সেশন নির্বাচন করুন</option>
              {(assignmentOptions?.sessions ?? []).map((session) => (
                <option key={session.SessionID} value={session.SessionID}>
                  {session.SessionName || session.SessionEngName || `সেশন #${convertBijoyToBengali(session.SessionID)}`}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            <span className="mb-1 block">সাবক্লাস <span className="text-red-500">*</span></span>
            <select
              className={input}
              value={assignmentSubClassId}
              onChange={(event) => {
                setAssignmentSubClassId(event.target.value);
                setPickL(new Set());
                setPickR(new Set());
              }}
            >
              <option value="">সাবক্লাস নির্বাচন করুন</option>
              {(assignmentOptions?.subClasses ?? []).map((subClass) => (
                <option key={subClass.SubClassID} value={subClass.SubClassID}>
                  {subClass.SubClass || subClass.SubClassEng || `সাবক্লাস #${convertBijoyToBengali(subClass.SubClassID)}`}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            <span className="mb-1 block">শিফট <span className="text-red-500">*</span></span>
            <select
              className={input}
              value={assignmentShiftId}
              onChange={(event) => {
                const shiftId = event.target.value;
                const shift = assignmentOptions?.shifts?.find(
                  (item) => String(item.ID) === shiftId,
                );
                setAssignmentShiftId(shiftId);
                setPickL(new Set());
                setPickR(new Set());
                setActiveShift(
                  shift ? shift.ShiftNameBangla || shift.ShiftNameEnglish || "" : "",
                );
              }}
            >
              <option value="">শিফট নির্বাচন করুন</option>
              {(assignmentOptions?.shifts ?? []).map((shift) => (
                <option key={shift.ID} value={shift.ID}>
                  {shift.ShiftNameBangla || shift.ShiftNameEnglish || `শিফট #${convertBijoyToBengali(shift.ID)}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!assignmentFiltersReady ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
            শিক্ষার্থীর তালিকা দেখতে সেশন, সাবক্লাস এবং শিফট নির্বাচন করুন।
          </div>
        ) : isAssignmentLoading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">তালিকা লোড হচ্ছে...</div>
        ) : isAssignmentError ? (
          <div className="rounded-lg bg-red-50 px-4 py-4 text-center text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            শিক্ষার্থীর তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <Panel
              title="উপলব্ধ শিক্ষার্থী" note="(শিফটে যোগ করার জন্য)"
              rows={left} picked={pickL} setPicked={setPickL}
              q={qL} setQ={setQL} showShift total={left.length}
              extra={
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />
                  শুধু অ্যাসাইন হয়নি ({convertBijoyToBengali(freeCount)})
                </label>
              }
            />
            <div className="flex flex-row justify-center gap-2 lg:flex-col lg:justify-center">
              <MoveBtn
                label="নির্বাচিত যোগ করুন"
                icon="→"
                disabled={!pickL.size || isMovingAssignment}
                onClick={() => moveSelectedUsers("assign")}
              />
              <MoveBtn
                label="নির্বাচিত অপসারণ"
                icon="←"
                disabled={!pickR.size || isMovingAssignment}
                onClick={() => moveSelectedUsers("remove")}
              />
            </div>
            <Panel
              title="নির্বাচিত শিক্ষার্থী" note={"(" + activeShift + " শিফটে আছে)"}
              rows={right} picked={pickR} setPicked={setPickR}
              q={qR} setQ={setQR} total={right.length}
            />
          </div>
        )}
      </section>

    </div>
  );
}

/* ---------- small pieces ---------- */
function MoveBtn({ label, icon, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-28 flex-col items-center rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </button>
  );
}

function Panel({ title, note, rows, picked, setPicked, q, setQ, showShift, total, extra }) {
  const allOn = rows.length > 0 && rows.every((e) => picked.has(e.id));
  const toggle = (id) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  };
  const toggleAll = () => {
    const next = new Set(picked);
    rows.forEach((employee) => {
      if (allOn) next.delete(employee.id);
      else next.add(employee.id);
    });
    setPicked(next);
  };
  const cols = ["ক্রমিক", "শিক্ষার্থী আইডি", "শিক্ষার্থী কোড", "শিক্ষার্থীর নাম", ...(showShift ? ["বর্তমান শিফট"] : [])];

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <h3 className="mb-2 text-sm font-semibold">{title} <span className="font-normal text-slate-500">{note}</span></h3>
      <div className="mb-2">
        <input className={input} placeholder="শিক্ষার্থীর নাম বা আইডি দিয়ে খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />
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
                <td className={td}>{convertBijoyToBengali(i + 1)}</td>
                <td className={td + " tabular-nums"}>{convertBijoyToBengali(e.id)}</td>
                <td className={td + " tabular-nums"}>{e.code == null ? "—" : convertBijoyToBengali(e.code)}</td>
                <td className={td}>{e.name}</td>
                {showShift && (
                  <td className={td}>
                    {e.shiftName || (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">অ্যাসাইন হয়নি</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-slate-500">কোনো শিক্ষার্থী পাওয়া যায়নি।</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span>মোট রেকর্ড: {convertBijoyToBengali(total)}</span>
        <span>নির্বাচিত: {convertBijoyToBengali(picked.size)}</span>
      </div>
    </div>
  );
}
