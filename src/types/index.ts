export type PaymentStatus = 'Failed' | 'Returned' | 'Rejected' | 'Cancelled' | 'Completed';
export type Environment = 'Production' | 'UAT' | 'Sandbox';
export type MOP = 'FedNow' | 'ACH' | 'SEPA' | 'SWIFT' | 'RTGS' | 'CHIPS';
export type NodeStatus = 'success' | 'failed' | 'idle' | 'active';

export interface FlowNode {
  id: string;
  label: string;
  type: 'channel' | 'middleware' | 'processor' | 'clearing' | 'fraud' | 'compliance' | 'corebanking' | 'advices';
  status: NodeStatus;
  detail: string;
  subNodes?: FlowNode[];
}

export interface InterfaceCall {
  id: string;
  application: string;
  appKey: string;
  direction: 'Request' | 'Response';
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  endpoint: string;
  payload: string;
  status: 'success' | 'failed' | 'pending';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
}

export interface IsoMessage {
  type: string;
  messageType: string;
  direction: string;
  rawPayload: string;
  convertedJson: string;
}

export interface AITriage {
  failureReason: string;
  rootCauseApplication: string;
  rootCauseNode: string;
  rawErrorCode: string;
  iso20022Code: string;
  iso20022Description: string;
  knowledgeBaseRef: string;
  knowledgeBaseTitle: string;
  knowledgeBaseSnippet: string;
  recommendedSteps: { label: string; action: string; variant: 'primary' | 'secondary' | 'danger' }[];
}

export interface Transaction {
  id: string;
  endToEndId: string;
  debitMOP: MOP;
  creditMOP: MOP;
  amount: number;
  currency: string;
  status: PaymentStatus;
  timestamp: string;
  scenario: string;
  debtorName: string;
  creditorName: string;
  debtorAccount: string;
  creditorAccount: string;
  flowNodes: FlowNode[];
  isoMessages: IsoMessage[];
  interfaceCalls: InterfaceCall[];
  logs: LogEntry[];
  aiTriage: AITriage;
}
