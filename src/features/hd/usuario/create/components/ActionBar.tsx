import { Button } from "antd";

type Props = {
  current: number;
  totalSteps: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function ActionBar({
  current,
  totalSteps,
  loading,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  return (
    <div className="sticky bottom-0  backdrop-blur  py-3">
      <div className="flex justify-between">
        {current > 0 ? (
          <Button onClick={onPrev} disabled={loading}>
            Anterior
          </Button>
        ) : (
          <span />
        )}

        <div className="ml-auto flex gap-2">
          {current < totalSteps - 1 ? (
            <Button type="primary" onClick={onNext} loading={loading}>
              Siguiente
            </Button>
          ) : (
            <Button type="primary" onClick={onSubmit} loading={loading}>
              Crear Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
