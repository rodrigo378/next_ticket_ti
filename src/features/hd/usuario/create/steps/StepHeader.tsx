"use client";

import { Steps, Typography } from "antd";
import type { StepsProps } from "antd";

const { Title, Text } = Typography;

type Props = {
  current: number;
  items: StepsProps["items"];
  onStepChange: (nextIndex: number) => void;
};

export default function StepsHeader({ current, items, onStepChange }: Props) {
  return (
    <div className="mt-6 px-2">
      <div className="flex flex-col items-center">
        <Title level={3} className="text-center m-0">
          📝 Crear Nuevo Ticket
        </Title>
        <Text type="secondary" className="text-center">
          Sigue los pasos para registrar su ticket
        </Text>
      </div>

      <Steps
        current={current}
        items={items}
        onChange={onStepChange}
        responsive
      />
    </div>
  );
}
