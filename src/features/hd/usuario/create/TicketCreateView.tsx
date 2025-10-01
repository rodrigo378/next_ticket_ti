// TicketCreateView.tsx

"use client";

import { Divider, Form } from "antd";
import { STEP_KEYS, useTicketCreate } from "./hooks/useTicketCreate";
import Step_0 from "./steps/Step_0";
import Step_1 from "./steps/Step_1";
import Step_2 from "./steps/Step_2";
import StepsHeader from "./steps/StepHeader";
import ActionBar from "./components/ActionBar";

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
    // ⬇️ nuevos flags de carga del hook
    loadingAreas,
    loadingCatalogo,
    loadingIncidencias,
  } = useTicketCreate();

  const renderStep = () =>
    current === 0 ? (
      <Step_0
        form={form}
        areas={areas}
        catalogo={catalogo}
        incidencias={incidencias}
        fetchCatalogo={fetchCatalogo}
        // ⬇️ pásalos al Step_0
        loadingAreas={loadingAreas}
        loadingCatalogo={loadingCatalogo}
        loadingIncidencias={loadingIncidencias}
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
