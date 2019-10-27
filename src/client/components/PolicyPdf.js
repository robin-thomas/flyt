import React from "react";

import { MDBBtn } from "mdbreact";
import { Spinner } from "react-bootstrap";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  PDFDownloadLink
} from "@react-pdf/renderer";

import config from "../../config.json";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf"
    },
    {
      src:
        "https://fonts.gstatic.com/s/robotocondensed/v14/Zd2E9abXLFGSr9G3YK2MsDR-eWpsHSw83BRsAQElGgc.ttf",
      fontWeight: 900
    }
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto"
  },
  header: {
    padding: "10% 0",
    textAlign: "center",
    fontSize: 25,
    fontWeight: "900"
  },
  container: {
    fontSize: 12,
    padding: "0% 10%"
  },
  policyContainer: {
    padding: "10% 0"
  },
  policy: {
    padding: "1%",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch"
  },
  policyHeader: {
    fontWeight: 900,
    width: "30%",
    textAlign: "left"
  },
  policyBody: {
    width: "70%",
    textAlign: "left"
  }
});

const Policy = ({ policy }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>Certificate of Insurance</Text>
      </View>
      <View style={styles.container}>
        <Text>
          This policy is issued as a matter of information only and confers no
          rights upon the certificate holder. This certificate does not amend,
          extend or alter the coverage afforded by the policy detailed below, or
          assume continuity of the policy.
        </Text>
        <View style={styles.policyContainer}>
          <View style={styles.policy}>
            <Text style={styles.policyHeader}>Insured by:</Text>
            <Text style={styles.policyBody}>
              {config.app.name.toUpperCase()}
            </Text>
          </View>
          <View style={styles.policy}>
            <Text style={styles.policyHeader}>Policy Type:</Text>
            <Text style={styles.policyBody}>Flight Insurance</Text>
          </View>
          <View style={styles.policy}>
            <Text style={styles.policyHeader}>Policy No:</Text>
            <Text style={styles.policyBody}>{policy.policyId}</Text>
          </View>
          <View style={styles.policy}>
            <Text style={styles.policyHeader}>Flight:</Text>
            <Text style={styles.policyBody}>
              {policy.flight.name} {policy.flight.fsCode}{" "}
              {policy.flight.carrierCode} from {policy.flight.from} airport (
              {policy.flight.departureTime})
            </Text>
          </View>
          <View style={styles.policy}>
            <Text style={styles.policyHeader}>Insured against:</Text>
            <Text style={styles.policyBody}>{policy.products.join(" ,")}</Text>
          </View>
        </View>
        <Text>Subject to the Terms and Conditions of this Policy.</Text>
      </View>
    </Page>
  </Document>
);

const PolicyPdf = ({ policy }) => (
  <PDFDownloadLink
    document={<Policy policy={policy} />}
    fileName={`policy-${policy.policyId}.pdf`}
  >
    {({ loading }) =>
      loading ? (
        <Spinner animation="border" size="sm" role="status" />
      ) : (
        <MDBBtn
          color="mdb-color"
          style={{ margin: "0" }}
          title="Download policy document"
        >
          Download
        </MDBBtn>
      )
    }
  </PDFDownloadLink>
);

export default PolicyPdf;
