import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, FlatList } from 'react-native';
import { Agendamento, Paciente } from '../database/initDatabase';

interface AgendamentoFormProps {
  visible: boolean;
  agendamento?: Agendamento | null;
  onClose: () => void;
  onSave: (data: string, tipo: string, id_paciente: number) => void;
  onLoadPacientes: () => Promise<Paciente[]>;
}

export const AgendamentoForm: React.FC<AgendamentoFormProps> = ({ visible, agendamento, onClose, onSave, onLoadPacientes }) => {
  const [dataStr, setDataStr] = useState('');
  const [tipo, setTipo] = useState('');
  const [id_paciente, setIdPaciente] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPacientes();
  }, [onLoadPacientes]);

  useEffect(() => {
    setErrorMessage(''); 

    if (visible) {
      loadPacientes();
    }
  }, [visible, onLoadPacientes]);

  useEffect(() => {
    if (agendamento) {
      // Como agora usamos a máscara visualmente, podemos manter as barras ao editar
      setDataStr(agendamento.data);
      setTipo(agendamento.tipo);
      setIdPaciente(agendamento.id_paciente);
    } else {
      setDataStr('');
      setTipo('');
      setIdPaciente(null);
    }
  }, [agendamento, visible]);

  const loadPacientes = async () => {
    if (onLoadPacientes) {
      const data = await onLoadPacientes();
      setPacientes(data);
    }
  };

  // 1. Nova função que cria a "máscara" da data enquanto o usuário digita
  const handleDateChange = (text: string) => {
    // Remove tudo que não for número
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    // Adiciona as barras automaticamente baseado no tamanho
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setDataStr(formatted);
  };

  const handleSave = () => {
    setErrorMessage('');

    if (id_paciente === null) {
      setErrorMessage('⚠️ Por favor, selecione um paciente.');
      return;
    }
    
    // Tira as barras só para fazer a contagem e verificar se a pessoa digitou todos os 8 números
    const rawDate = dataStr.replace(/\D/g, '');
    
    if (rawDate.length !== 8) {
      setErrorMessage('❌ Data incompleta. Digite o Dia, Mês e Ano completos.');
      return;
    }
    if (!tipo.trim()) {
      setErrorMessage('⚠️ Por favor, informe a especialidade (ex: Ortopedista).');
      return;
    }

    // Extrai Dia, Mês e Ano usando os números puros
    const dia = parseInt(rawDate.substring(0, 2), 10);
    const mes = parseInt(rawDate.substring(2, 4), 10);
    const ano = parseInt(rawDate.substring(4, 8), 10);

    // Validações de limites
    if (dia < 1 || dia > 31) {
      setErrorMessage('❌ Dia inválido. O dia deve ser entre 01 e 31.');
      return;
    }
    if (mes < 1 || mes > 12) {
      setErrorMessage('❌ Mês inválido. O mês deve ser entre 01 e 12.');
      return;
    }
    if (ano > 2027) {
      setErrorMessage('❌ Ano inválido. Só é possível agendar até 2027.');
      return;
    }

    // Checa se a data do agendamento já passou
    const dataConsulta = new Date(ano, mes - 1, dia); 
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    if (dataConsulta < hoje) {
      setErrorMessage('❌ Data inválida. Não é possível criar um agendamento no passado.');
      return;
    }

    // Formata bonitinho para salvar no banco de dados
    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mes).padStart(2, '0');
    const dataFormatada = `${diaFormatado}/${mesFormatado}/${ano}`;

    onSave(dataFormatada, tipo.trim(), id_paciente);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <ScrollView>
          <View style={styles.container}>
            <Text style={styles.title}>{agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</Text>
            
            <Text style={styles.label}>Selecione o Paciente</Text>
            {pacientes.length === 0 ? (
              <Text style={styles.noPacientes}>Nenhum paciente cadastrado. Cadastre primeiro na aba Pacientes.</Text>
            ) : (
              <>
                <TouchableOpacity style={styles.selectButton} onPress={() => setShowPicker(true)}>
                  <Text style={[styles.selectText, !id_paciente && styles.selectPlaceholder]}>
                    {pacientes.find(p => p.id === id_paciente)?.nome || 'Selecione um paciente...'}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>

                <Modal visible={showPicker} transparent animationType="fade">
                  <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerTitle}>Selecionar Paciente</Text>
                      <FlatList
                        data={pacientes}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[styles.pickerItem, id_paciente === item.id && styles.pickerItemSelected]}
                            onPress={() => {
                              setIdPaciente(item.id);
                              setShowPicker(false);
                            }}
                          >
                            <Text style={[styles.pickerItemText, id_paciente === item.id && styles.pickerItemTextSelected]}>
                              {item.nome}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data do Agendamento</Text>
              <TextInput 
                style={styles.input} 
                placeholder="DD/MM/AAAA" 
                value={dataStr} 
                // Chama a nossa nova função que aplica a máscara
                onChangeText={handleDateChange} 
                keyboardType="numeric"
                // Mudou para 10 por conta das duas barras (/)
                maxLength={10} 
                placeholderTextColor="#999" 
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Especialidade (ex: Ortopedista)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ortopedista, Dentista..." 
                value={tipo} 
                onChangeText={setTipo} 
                placeholderTextColor="#999" 
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  container: { backgroundColor: '#fff', marginHorizontal: 20, marginVertical: 40, borderRadius: 20, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  noPacientes: { fontSize: 14, color: '#dc2626', textAlign: 'center', padding: 16, backgroundColor: '#fee2e2', borderRadius: 8, marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#f8f6ff', borderRadius: 12, padding: 14, fontSize: 16, color: '#1a1a2e', borderWidth: 1, borderColor: '#e0e0e0' },
  errorContainer: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  saveButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#6c3ce0', alignItems: 'center' },
  saveText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  selectButton: { backgroundColor: '#f8f6ff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 20 },
  selectText: { fontSize: 16, color: '#1a1a2e' },
  selectPlaceholder: { color: '#999' },
  selectArrow: { fontSize: 12, color: '#666' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '80%', maxHeight: '60%' },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 16, textAlign: 'center' },
  pickerItem: { padding: 14, borderRadius: 8, marginBottom: 8, backgroundColor: '#f8f6ff' },
  pickerItemSelected: { backgroundColor: '#6c3ce0' },
  pickerItemText: { fontSize: 16, color: '#1a1a2e', textAlign: 'center' },
  pickerItemTextSelected: { color: '#fff', fontWeight: '600' },
});