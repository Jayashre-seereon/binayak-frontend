import { Table } from "antd";
import dayjs from "dayjs";

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const ReportTable = ({
  type,
  data = [],
  loading = false,
}) => {
  const salesColumns = [
    {
      title: "Date",
      dataIndex: "saleDate",
      key: "saleDate",
      width: 130,

      render: (value) =>
        value
          ? dayjs(value).format(
              "DD MMM YYYY"
            )
          : "-",
    },

    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 150,

      render: (value) =>
        value || "-",
    },

    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,

      render: (value) =>
        value || "-",
    },

    {
      title: "Phone",
      dataIndex: "customerPhone",
      key: "customerPhone",
      width: 140,

      render: (value) =>
        value || "-",
    },

    {
      title: "Items",
      key: "items",
      align: "center",
      width: 80,

      render: (_, record) =>
        record.items?.length || 0,
    },

    {
      title: "Gross Amount",
      dataIndex: "grossTotal",
      key: "grossTotal",
      align: "right",
      width: 150,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      align: "right",
      width: 130,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "GST",
      dataIndex: "taxAmount",
      key: "taxAmount",
      align: "right",
      width: 120,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Old Gold",
      dataIndex: "oldGoldAmount",
      key: "oldGoldAmount",
      align: "right",
      width: 140,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Advance",
      dataIndex: "advanceAmount",
      key: "advanceAmount",
      align: "right",
      width: 140,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Payable",
      dataIndex: "payableAmount",
      key: "payableAmount",
      align: "right",
      width: 150,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      align: "right",
      width: 140,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      align: "right",
      width: 140,

      render: (value) =>
        formatCurrency(value),
    },

    {
      title: "Payment Mode",
      key: "paymentMode",
      width: 180,

      render: (_, record) => {
        if (!record.payments?.length) {
          return "-";
        }

        return record.payments
          .map(
            (payment) =>
              payment.paymentMode
          )
          .filter(Boolean)
          .join(", ");
      },
    },
  ];

  const purchaseColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,

      render: (value, record) => {
        const purchaseDate =
          value ||
          record.purchaseDate ||
          record.createdAt;

        return purchaseDate
          ? dayjs(
              purchaseDate
            ).format("DD MMM YYYY")
          : "-";
      },
    },

    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 150,

      render: (value) =>
        value || "-",
    },

    {
      title: "Purchase Type",
      dataIndex: "purchaseType",
      key: "purchaseType",
      width: 150,

      render: (value) =>
        value || "-",
    },

    {
      title: "Party / Customer",
      key: "party",
      width: 200,

      render: (_, record) =>
        record.party?.name ||
        record.customerName ||
        "-",
    },

    {
      title: "Phone",
      key: "phone",
      width: 140,

      render: (_, record) =>
        record.customerPhone ||
        record.party?.phone ||
        "-",
    },

    {
      title: "Items",
      key: "items",
      align: "center",
      width: 80,

      render: (_, record) =>
        record.items?.length || 0,
    },

    {
      title: "Amount",
      key: "amount",
      align: "right",
      width: 150,

      render: (_, record) => {
        const amount =
          record.netPurchase ??
          record.netPayable ??
          record.totalAmount ??
          record.grossTotal ??
          record.grossAmount ??
          0;

        return formatCurrency(amount);
      },
    },

    {
      title: "Paid",
      key: "paid",
      align: "right",
      width: 140,

      render: (_, record) => {
        if (
          record.paidAmount !==
          undefined
        ) {
          return formatCurrency(
            record.paidAmount
          );
        }

        const paid =
          record.payments?.reduce(
            (total, payment) =>
              total +
              Number(
                payment.amount || 0
              ),
            0
          ) || 0;

        return formatCurrency(paid);
      },
    },

    {
      title: "Balance",
      key: "balance",
      align: "right",
      width: 150,

      render: (_, record) => {
        const balance =
          record.balanceAmount ??
          record.dueAmount ??
          0;

        return formatCurrency(balance);
      },
    },
  ];

  const columns =
    type === "sales"
      ? salesColumns
      : purchaseColumns;

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <Table
        rowKey={(record) =>
          record.id ||
          record.invoiceNo
        }
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{
          x: "max-content",
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [
            "10",
            "20",
            "50",
            "100",
          ],
        }}
      />
    </div>
  );
};

export default ReportTable;