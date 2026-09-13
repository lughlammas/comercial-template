import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatBRL, lineTotal, sumItems } from "@/lib/money";

export type PdfProposal = {
  title: string;
  notes: string | null;
  createdAt: Date | string;
  status: string;
  companyName: string;
  sellerName: string;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1d23",
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#8a7040",
    marginBottom: 6,
  },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#5c6170", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  block: { width: "48%" },
  label: { fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: "#8a7040", marginBottom: 4 },
  name: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  muted: { color: "#5c6170", marginTop: 2 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d8d0c0",
    paddingBottom: 6,
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee6d8",
    paddingVertical: 7,
  },
  colDesc: { width: "46%" },
  colQty: { width: "14%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  totalBox: { marginTop: 16, alignItems: "flex-end" },
  total: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  notes: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#eee6d8" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 8, color: "#8a8a8a" },
});

function statusLabel(status: string) {
  if (status === "enviada") return "Enviada";
  if (status === "aceita") return "Aceita";
  return "Rascunho";
}

export function ProposalPdf({ proposal }: { proposal: PdfProposal }) {
  const total = sumItems(proposal.items);
  const date = new Date(proposal.createdAt).toLocaleDateString("pt-BR");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>Proposta comercial</Text>
        <Text style={styles.title}>{proposal.title}</Text>
        <Text style={styles.subtitle}>
          {date} · {statusLabel(proposal.status)}
        </Text>
        <View style={styles.row}>
          <View style={styles.block}>
            <Text style={styles.label}>De</Text>
            <Text style={styles.name}>{proposal.companyName}</Text>
            <Text style={styles.muted}>{proposal.sellerName}</Text>
          </View>
          <View style={styles.block}>
            <Text style={styles.label}>Para</Text>
            <Text style={styles.name}>{proposal.clientName}</Text>
            {proposal.clientCompany ? <Text style={styles.muted}>{proposal.clientCompany}</Text> : null}
            {proposal.clientEmail ? <Text style={styles.muted}>{proposal.clientEmail}</Text> : null}
          </View>
        </View>
        <View style={styles.tableHead}>
          <Text style={styles.colDesc}>Descrição</Text>
          <Text style={styles.colQty}>Qtd</Text>
          <Text style={styles.colPrice}>Preço</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {proposal.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatBRL(item.unitPrice)}</Text>
            <Text style={styles.colTotal}>{formatBRL(lineTotal(item.quantity, item.unitPrice))}</Text>
          </View>
        ))}
        <View style={styles.totalBox}>
          <Text style={styles.total}>Total {formatBRL(total)}</Text>
        </View>
        {proposal.notes ? (
          <View style={styles.notes}>
            <Text style={styles.label}>Observações</Text>
            <Text>{proposal.notes}</Text>
          </View>
        ) : null}
        <Text style={styles.footer}>
          Documento gerado pelo template Comercial · dados de exemplo quando aplicável
        </Text>
      </Page>
    </Document>
  );
}
