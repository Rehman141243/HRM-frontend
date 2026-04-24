export const mockNotificationKpis = {
  queued: 14,
  approvals: 6,
  birthdays: 2,
  policyUpdates: 1,
};

export const mockNotifications = [
  { id: "NTF-4001", type: "Approval", message: "Leave request LR-1045 awaiting approval", channel: "Email", when: "10 min ago", status: "Queued" },
  { id: "NTF-4004", type: "Reminder", message: "Training session: Excel for HR tomorrow 11:00 AM", channel: "Email", when: "1 hour ago", status: "Sent" },
  { id: "NTF-4010", type: "Birthday", message: "Birthday: Noor Fatima (Sales)", channel: "Email/SMS", when: "Today", status: "Scheduled" },
  { id: "NTF-4014", type: "Policy", message: "Updated: Remote work policy v2.1", channel: "Email", when: "Yesterday", status: "Sent" },
];

