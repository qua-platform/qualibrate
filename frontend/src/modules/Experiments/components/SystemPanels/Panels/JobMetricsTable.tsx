import Row from "../../../../../DEPRECATED_components/Table/Row";
import RowGroup from "../../../../../DEPRECATED_components/Table/RowGroup";
import Table from "../../../../../DEPRECATED_components/Table/Table";
import styles from "./Panels.module.scss";

const JobMetricsTable = () => {
  return (
    <Table>
      <RowGroup className={styles.tableHeader}>
        <Row>Qubit</Row>
        <Row>T1(us)</Row>
        <Row>T2(us)</Row>
        <Row>Frequency (GHz)</Row>
        <Row>Anharmonicity (GHz)</Row>
        <Row>Readout assignment error</Row>
      </RowGroup>
      <RowGroup>
        <Row>Q1</Row>
        <Row>110.89</Row>
        <Row>128.61</Row>
        <Row>5.257</Row>
        <Row>-0.33666</Row>
        <Row>8.600e-3</Row>
      </RowGroup>
      <RowGroup>
        <Row>Q1</Row>
        <Row>110.89</Row>
        <Row>128.61</Row>
        <Row>5.257</Row>
        <Row>-0.33666</Row>
        <Row>8.600e-3</Row>
      </RowGroup>
      <RowGroup>
        <Row>Q1</Row>
        <Row>110.89</Row>
        <Row>128.61</Row>
        <Row>5.257</Row>
        <Row>-0.33666</Row>
        <Row>8.600e-3</Row>
      </RowGroup>
    </Table>
  );
};

export default JobMetricsTable;
