import { useMemo, useState } from "react";
import {
  PERIOD_TYPES,
  formatPeriodLabel,
  getPeriodRange,
} from "../utils/reportPeriod";

export function useReportPeriod(defaultPeriod = PERIOD_TYPES.monthly) {
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState(defaultPeriod);
  const [referenceDate, setReferenceDate] = useState(today);
  const [customEndDate, setCustomEndDate] = useState(today);

  const range = useMemo(
    () => getPeriodRange(period, referenceDate, customEndDate),
    [period, referenceDate, customEndDate]
  );

  const periodLabel = useMemo(
    () => formatPeriodLabel(period, referenceDate, customEndDate),
    [period, referenceDate, customEndDate]
  );

  return {
    period,
    setPeriod,
    referenceDate,
    setReferenceDate,
    customEndDate,
    setCustomEndDate,
    range,
    periodLabel,
  };
}
