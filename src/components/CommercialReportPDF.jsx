import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import PDFLogo from './PDFLogo';

// Registrar fontes (opcional - usar fontes padrão do sistema)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
  ]
});

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #174A8B',
    paddingBottom: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#174A8B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    // textAlign: 'center',
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#174A8B',
    marginBottom: 15,
    borderBottom: '1 solid #e0e0e0',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.4,
    marginBottom: 4,
    marginLeft: 15,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  indicatorCard: {
    width: '30%',
    border: '1 solid #e0e0e0',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  indicatorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#174A8B',
    textAlign: 'center',
    marginBottom: 5,
  },
  indicatorScore: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  indicatorClassification: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  indicatorDescription: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

// Componente para renderizar pontos-chave
const KeyPoints = ({ points }) => (
  <View>
    {points.map((point, index) => (
      <Text key={index} style={styles.bulletPoint}>
        • {point}
      </Text>
    ))}
  </View>
);

// Componente para renderizar lições aprendidas
const LessonsLearned = ({ lessons }) => (
  <View>
    {lessons.pontos_fortes && lessons.pontos_fortes.length > 0 && (
      <View>
        <Text style={styles.subsectionTitle}>Pontos Fortes:</Text>
        <KeyPoints points={lessons.pontos_fortes} />
      </View>
    )}
    {lessons.oportunidades_melhoria && lessons.oportunidades_melhoria.length > 0 && (
      <View>
        <Text style={styles.subsectionTitle}>Oportunidades de Melhoria:</Text>
        <KeyPoints points={lessons.oportunidades_melhoria} />
      </View>
    )}
    {lessons.praticas_funcionaram && lessons.praticas_funcionaram.length > 0 && (
      <View>
        <Text style={styles.subsectionTitle}>Práticas que Funcionaram:</Text>
        <KeyPoints points={lessons.praticas_funcionaram} />
      </View>
    )}
    {lessons.aspectos_aprimorar && lessons.aspectos_aprimorar.length > 0 && (
      <View>
        <Text style={styles.subsectionTitle}>Aspectos a Aprimorar:</Text>
        <KeyPoints points={lessons.aspectos_aprimorar} />
      </View>
    )}
  </View>
);

// Componente para renderizar indicadores de satisfação
const SatisfactionIndicators = ({ indicators }) => {
  if (!indicators) return null;

  const getScoreColor = (score, type) => {
    if (type === 'nps') {
      return score >= 9 ? '#10B981' : score >= 7 ? '#F59E0B' : '#EF4444';
    } else if (type === 'ces') {
      return score >= 6 ? '#10B981' : score >= 4 ? '#F59E0B' : '#EF4444';
    } else if (type === 'csat') {
      return score >= 4 ? '#10B981' : score >= 3 ? '#F59E0B' : '#EF4444';
    }
    return '#666666';
  };

  const getClassification = (score, type) => {
    if (type === 'nps') {
      return score >= 9 ? 'Promotor' : score >= 7 ? 'Neutro' : 'Detrator';
    } else if (type === 'ces') {
      return score >= 6 ? 'Baixo Esforço' : score >= 4 ? 'Esforço Médio' : 'Alto Esforço';
    } else if (type === 'csat') {
      return score >= 4 ? 'Muito Satisfeito' : score >= 3 ? 'Satisfeito' : 'Insatisfeito';
    }
    return '';
  };

  return (
    <View style={styles.indicatorsGrid}>
      {indicators.nps && (
        <View style={styles.indicatorCard}>
          <Text style={styles.indicatorTitle}>NPS</Text>
          <Text style={[styles.indicatorScore, { color: getScoreColor(indicators.nps.pontuacao, 'nps') }]}>
            {indicators.nps.pontuacao}/10
          </Text>
          <Text style={[styles.indicatorClassification, { color: getScoreColor(indicators.nps.pontuacao, 'nps') }]}>
            {getClassification(indicators.nps.pontuacao, 'nps')}
          </Text>
          <Text style={styles.indicatorDescription}>
            {indicators.nps.justificativa}
          </Text>
        </View>
      )}
      
      {indicators.ces && (
        <View style={styles.indicatorCard}>
          <Text style={styles.indicatorTitle}>CES</Text>
          <Text style={[styles.indicatorScore, { color: getScoreColor(indicators.ces.pontuacao, 'ces') }]}>
            {indicators.ces.pontuacao}/7
          </Text>
          <Text style={[styles.indicatorClassification, { color: getScoreColor(indicators.ces.pontuacao, 'ces') }]}>
            {getClassification(indicators.ces.pontuacao, 'ces')}
          </Text>
          <Text style={styles.indicatorDescription}>
            {indicators.ces.justificativa}
          </Text>
        </View>
      )}
      
      {indicators.csat && (
        <View style={styles.indicatorCard}>
          <Text style={styles.indicatorTitle}>CSAT</Text>
          <Text style={[styles.indicatorScore, { color: getScoreColor(indicators.csat.pontuacao, 'csat') }]}>
            {indicators.csat.pontuacao}/5
          </Text>
          <Text style={[styles.indicatorClassification, { color: getScoreColor(indicators.csat.pontuacao, 'csat') }]}>
            {getClassification(indicators.csat.pontuacao, 'csat')}
          </Text>
          <Text style={styles.indicatorDescription}>
            {indicators.csat.justificativa}
          </Text>
        </View>
      )}
    </View>
  );
};

// Componente principal do PDF
const CommercialReportPDF = ({ insight, insightId }) => {
  const structuredData = insight?.insight?.as_structured_json;
  const sentimentAnalysis = structuredData?.sentiment_analysis;
  const indicators = sentimentAnalysis?.indicadores_satisfacao;
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const insightDate = insight?.created_at 
    ? new Date(insight.created_at).toLocaleDateString('pt-BR')
    : 'N/A';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <PDFLogo useImage={true} />
          </View>
          <Text style={styles.subtitle}>Análise de Insight - {insightId}</Text>
          <View style={styles.metadata}>
            <Text>Data do Insight: {insightDate}</Text>
            <Text>Gerado em: {currentDate}</Text>
          </View>
        </View>

        {/* Seção: Indicadores de Satisfação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores de Satisfação</Text>
          <SatisfactionIndicators indicators={indicators} />
        </View>

        {/* Seção: Resumo e Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo e Insights</Text>
          
          {structuredData?.resume && (
            <View>
              <Text style={styles.subsectionTitle}>Resumo da Conversa</Text>
              <Text style={styles.text}>{structuredData.resume}</Text>
            </View>
          )}

          {sentimentAnalysis && (
            <View>
              <Text style={styles.subsectionTitle}>Análise de Sentimento</Text>
              <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>Sentimento: </Text>
                {sentimentAnalysis.sentimento}
              </Text>
              {sentimentAnalysis.justificativa && (
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Justificativa: </Text>
                  {sentimentAnalysis.justificativa}
                </Text>
              )}
            </View>
          )}

          {sentimentAnalysis?.pontos_chave && sentimentAnalysis.pontos_chave.length > 0 && (
            <View>
              <Text style={styles.subsectionTitle}>Pontos-Chave</Text>
              <KeyPoints points={sentimentAnalysis.pontos_chave} />
            </View>
          )}

          {sentimentAnalysis?.licoes_aprendidas && (
            <View>
              <Text style={styles.subsectionTitle}>Lições Aprendidas</Text>
              <LessonsLearned lessons={sentimentAnalysis.licoes_aprendidas} />
            </View>
          )}
        </View>

        {/* Número da página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export default CommercialReportPDF;
