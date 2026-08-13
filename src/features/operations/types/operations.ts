export type OperationsJobStatus =
  | "awaiting_customer_confirmation"
  | "cancelled"
  | "completed"
  | "in_progress"
  | "scheduled"
  | "unscheduled";

export type OperationsInboxItem = {
  attention_required: boolean;
  customer_name: string;
  id: string;
  job_number: string;
  mobile_number: string;
  order_number: string;
  pickup_city_ar: string;
  pickup_city_en: string;
  pickup_window_start: string | null;
  reference_number: string;
  service_name_ar: string;
  service_name_en: string;
  status: OperationsJobStatus;
  trip_count: number;
  updated_at: string;
};

export type OperationsInboxPage = {
  items: OperationsInboxItem[];
  page: number;
  page_size: number;
  total: number;
};

export type OperationsTrip = {
  condition: "delayed" | "normal" | "operational_issue" | "paused";
  delivery_window_end: string | null;
  delivery_window_start: string | null;
  driver_id: string | null;
  id: string;
  job_id: string;
  pickup_window_end: string | null;
  pickup_window_start: string | null;
  status: string;
  trip_number: number;
  vehicle_id: string | null;
  workers_count: number;
};

export type OperationsJobDetail = {
  activity: Array<{
    actor_name: string | null;
    details: Record<string, unknown>;
    event_key: string;
    id: string;
    occurred_at: string;
  }>;
  cancellation_requests: Array<{
    customer_reason: string | null;
    id: string;
    requested_at: string;
    status: string;
  }>;
  delivery: { city_ar: string; city_en: string; formatted_address: string };
  job: {
    attention_required: boolean;
    customer_confirmed_at: string | null;
    id: string;
    job_number: string;
    status: OperationsJobStatus;
  };
  lead: {
    customer_name: string;
    customer_notes: string | null;
    mobile_number: string;
    reference_number: string;
    service_name_ar: string;
    service_name_en: string;
  };
  order: {
    currency: string;
    order_number: string;
    subtotal_amount: number;
    tax_amount: number;
    total_amount: number;
  };
  pickup: { city_ar: string; city_en: string; formatted_address: string };
  quotation: { customer_notes: string | null; quotation_number: string; revision_number: number };
  resources: {
    drivers: Array<{ display_name: string; id: string }>;
    vehicles: Array<{ id: string; plate_number: string; vehicle_type: string }>;
  };
  trips: OperationsTrip[];
};

export type TrackingPayload = {
  cancellation_status: string | null;
  delivery: { formatted_address: string };
  job: { customer_confirmed_at: string | null; status: OperationsJobStatus };
  lead: { reference_number: string; service_name_ar: string; service_name_en: string };
  pickup: { formatted_address: string };
  state: "active";
  trips: Array<Record<string, unknown>>;
};
