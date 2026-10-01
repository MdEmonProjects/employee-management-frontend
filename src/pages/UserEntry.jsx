import { useEffect, useMemo, useState } from 'react';
import SvgIcon from '../components/icons/SvgIcon';
import { FormProvider, useForm } from 'react-hook-form';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { useParams } from 'react-router-dom';
import DefaultInput from '../components/DefaultInput';
import DefaultSelect from '../components/DefaultSelect';
import { useGetSessionsQuery } from '../features/session/sessionQuerySlice';
import { useCreateUserMutation } from '../features/user/userQuerySlice';
import { toast } from 'react-toastify';

export default function UserEntry() {
  const methods = useForm();
  const { handleSubmit, setValue } = methods;

  const {
    data: sessionList,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useGetSessionsQuery();
  const { classid } = useParams();
  const [createUser, { isLoading, error }] = useCreateUserMutation();

  useEffect(()=>{
    if(classid){
      setValue("ClassID", classid)
    }
  }, [classid])

  const onSubmit = async (data) => {
    console.log(data);
    
    try {
      await createUser(data).unwrap();
      toast.success('Student created successfully!', {
        progressStyle: {
          background: '#C9724F',
        },
      });
    } catch (error) {
      toast.error(
        error?.data?.message || 'Failed to add student. Please try again.'
      );
    }
  };
  return (

    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 text-sm text-muted">
        <a href="/dashboard" className="shrink-0 hover:text-foreground">হোম</a>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="shrink-0">নিবন্ধন সংক্রান্ত</span>
        <svg aria-hidden="true" className="size-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span aria-current="page" className="truncate font-medium text-foreground">শিক্ষাথী নিবন্ধন</span>
      </nav>

      <section className="overflow-hidden rounded-md border border-border bg-surface">
        <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-icon-bg text-brand-600">
              <SvgIcon name="UserList" size={22} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-foreground">শিক্ষাথী নিবন্ধন ফর্ম</h1>
              <p className="text-sm text-muted">ব্যক্তিগত তথ্য</p>
            </div>
          </div>
          {/* <button type="button" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
            <SvgIcon name="TbPlus" size={18} />
            New Registration
          </button> */}
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          {/* <h2 className="text-lg font-semibold text-foreground mb-1">
            শিক্ষাথী নিবন্ধন ফর্ম — ব্যক্তিগত তথ্য
          </h2> */}
          {/* <p className="text-sm text-muted mb-4">
            নির্বাচিত বোর্ড: বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ
          </p> */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-8">
                {/* Section: User Info */}
                <div className="grid md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                  <DefaultInput label={"নাম"} placeholder={"নাম"} registerKey={"UserName"} />

                  <DefaultSelect label={"লিঙ্গ"} options={[{ id: 1, value: "ছেলে" }, { id: 2, value: "মহিলা" }]} registerKey={"GenderID"} require={"Gender is Required"} nameField={"value"} valueField={"id"} />

                  <DefaultInput label={"পিতার নাম"} placeholder={"পিতার নাম"} registerKey={"FatherName"} />
                  <DefaultInput label={"মাতার নাম"} placeholder={"মাতার নাম"} registerKey={"MotherName"} />

                  <DefaultSelect
                    label={"Session"}
                    options={sessionList ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    registerKey="SessionID"
                  />

                  <PhoneNumberInput
                    label={
                      <span className="text-red-500">Mobile 1* (SMS will be sent)</span>
                    }
                    registerKey="Mobile1"
                    require={true}
                    minLength={11}
                    maxLength={11}
                    allowedPrefixes={[
                      '013',
                      '014',
                      '015',
                      '016',
                      '017',
                      '018',
                      '019',
                    ]}
                  />
                  <PhoneNumberInput
                    label="Mobile 2"
                    registerKey="Mobile2"
                    placeholder="ফোন নম্বর লিখুন"
                    require={false}
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isLoading ? 'তৈরি হচ্ছে…' : 'শিক্ষাথী নিবন্ধন করুন'}
                  </button>
                </div>


              </div>
            </form>
          </FormProvider>

        </div>
      </section>




    </div>


  );
}
