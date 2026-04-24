export const mockKpis = [
  { title: "Employees", value: 134, hint: "+3 this month" },
  { title: "Present Today", value: 118, hint: "7 absent • 9 on leave" },
  { title: "Pending Approvals", value: 11, hint: "Leave • Overtime • Timesheets" },
  { title: "Payroll Cycle", value: "Apr 2026", hint: "6 pending payslips" },
];

export const mockTrend = [
  { name: "Mon", attendance: 114, leaves: 6 },
  { name: "Tue", attendance: 116, leaves: 8 },
  { name: "Wed", attendance: 120, leaves: 5 },
  { name: "Thu", attendance: 118, leaves: 7 },
  { name: "Fri", attendance: 122, leaves: 6 },
  { name: "Sat", attendance: 98, leaves: 10 },
  { name: "Sun", attendance: 72, leaves: 14 },
];

export const mockDept = [
  { name: "Engineering", value: 42 },
  { name: "Sales", value: 28 },
  { name: "HR", value: 14 },
  { name: "Finance", value: 11 },
  { name: "Operations", value: 25 },
  { name: "Support", value: 14 },
];

export const mockActivity = [
  { id: "A-01", title: "Leave request approved", meta: "LR-1042 • Bilal Raza", when: "12m ago" },
  { id: "A-02", title: "Overtime submitted", meta: "EMP-0002 • 2h", when: "1h ago" },
  { id: "A-03", title: "Document uploaded", meta: "CNIC • EMP-0005", when: "Yesterday" },
  { id: "A-04", title: "Payslip generated", meta: "PS-24043 • Apr 2026", when: "Yesterday" },
];

export const mockChat = [
  { id: "C-01", name: "Ayesha", text: "Morning! Please review the leave queue before 3pm.", time: "09:12" },
  { id: "C-02", name: "Bilal", text: "Approved overtime for the support shift.", time: "09:44" },
  { id: "C-03", name: "Sara", text: "Payroll exports are ready for Apr 2026.", time: "10:05" },
];

export const mockPayments = [
  { id: "P-01", name: "Emma Ryan Jr.", date: "Mar 9, 2026", amount: 4823, status: "Done" },
  { id: "P-02", name: "Justin Weber", date: "Mar 2, 2026", amount: 3937, status: "Pending" },
];

export const mockTransactions = [
  { id: "T-01", receiver: "Emma Ryan Jr.", type: "Salary", status: "Pending", date: "Feb 19, 2026", amount: 3892 },
  { id: "T-02", receiver: "Adrian Daren", type: "Bonus", status: "Done", date: "Feb 18, 2026", amount: 1073 },
  { id: "T-03", receiver: "Justin Weber", type: "Salary", status: "Done", date: "Feb 17, 2026", amount: 4201 },
  { id: "T-04", receiver: "Ayesha Khan", type: "Allowance", status: "Pending", date: "Feb 16, 2026", amount: 650 },
];

