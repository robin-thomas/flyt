import React from "react";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from "@react-pdf/renderer";

import config from "../../config.json";

const styles = StyleSheet.create({
  appName: {
    textDecoration: "uppercase",
    textAlign: "center",
    fontSize: "25px",
    fontWeight: "900"
  }
});

const PolicyPdf = ({ policy }) => (
  <Document>
    <Page size="A4">
      <View>
        <Text style={styles.appName}>{config.app.name}</Text>
      </View>
    </Page>
  </Document>
);

export default PolicyPdf;
