// TicketCreateView.tsx

"use client";

import ActionBar from "@/features/ticket-vir/create/components/ActionBar";
import {
  STEP_KEYS,
  useTicketCreate,
} from "@/features/ticket-vir/create/hooks/useTicketCreate";
import Step_0 from "@/features/ticket-vir/create/steps/Step_0";
import Step_1 from "@/features/ticket-vir/create/steps/Step_1";
import Step_2 from "@/features/ticket-vir/create/steps/Step_2";
import StepsHeader from "@/features/ticket-vir/create/steps/StepHeader";
import { Divider, Form } from "antd";

export default function TicketCreateView() {
  const {
    form,
    current,
    next,
    prev,
    onSubmit,
    loading,
    areas,
    catalogo,
    incidencias,
    fileList,
    setFileList,
    stepItems,
    fetchCatalogo,
  } = useTicketCreate();

  const renderStep = () =>
    current === 0 ? (
      <Step_0
        form={form}
        areas={areas}
        catalogo={catalogo}
        incidencias={incidencias}
        fetchCatalogo={fetchCatalogo}
      />
    ) : current === 1 ? (
      <Step_1 fileList={fileList} setFileList={setFileList} />
    ) : (
      <Step_2
        form={form}
        areas={areas}
        incidencias={incidencias}
        fileList={fileList}
      />
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Crear Ticket</h1>
      <StepsHeader
        current={current}
        items={stepItems}
        onStepChange={(i) => (i > current ? next() : prev())}
      />
      <Divider />
      <Form layout="vertical" form={form}>
        {renderStep()}
        <Divider />
        <ActionBar
          current={current}
          totalSteps={STEP_KEYS.length}
          loading={loading}
          onPrev={prev}
          onNext={next}
          onSubmit={onSubmit}
        />
      </Form>
    </div>
  );
}
