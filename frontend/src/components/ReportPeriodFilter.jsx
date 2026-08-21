import { Col, Form, Row } from "react-bootstrap";
import VfButton from "./VfButton";
import { PERIOD_OPTIONS } from "../utils/reportPeriod";

export default function ReportPeriodFilter({
  period,
  onPeriodChange,
  referenceDate,
  onReferenceDateChange,
  customEndDate,
  onCustomEndDateChange,
  periodLabel,
  onPrint,
  resultCount,
}) {
  const isCustom = period === "custom";

  return (
    <div className="panel mb-3 no-print report-period-filter">
      <Row className="g-3">
        <Col xs={12}>
          <Form.Label className="mb-2">Période du rapport</Form.Label>
          <div className="period-pills">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`period-pill${period === opt.id ? " active" : ""}`}
                onClick={() => onPeriodChange(opt.id)}
              >
                <i className={`bi ${opt.icon} me-1`} />
                {opt.label}
              </button>
            ))}
          </div>
        </Col>

        <Col md={isCustom ? 4 : 6}>
          <Form.Group>
            <Form.Label>{isCustom ? "Date de début" : "Date de référence"}</Form.Label>
            <Form.Control
              type="date"
              value={referenceDate}
              onChange={(e) => onReferenceDateChange(e.target.value)}
            />
          </Form.Group>
        </Col>

        {isCustom && (
          <Col md={4}>
            <Form.Group>
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        <Col md={isCustom ? 4 : 6} className="d-flex align-items-end gap-2">
          <VfButton
            type="button"
            className="flex-grow-1"
            icon="bi-printer"
            onClick={onPrint}
          >
            Imprimer le rapport
          </VfButton>
        </Col>

        <Col xs={12}>
          <div className="report-period-summary">
            <span className="report-period-badge">{periodLabel}</span>
            {resultCount != null && (
              <span className="report-period-count">
                {resultCount} enregistrement{resultCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
