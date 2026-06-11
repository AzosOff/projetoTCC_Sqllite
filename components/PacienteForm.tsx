import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Paciente } from '../database/initDatabase';

interface PacienteFormProps {
  visible: boolean;
  paciente?: Paciente | null;
  onClose: () => void;
  onSave: (nome: string, email: string, idade: string, numero: string) => void;
}

export const PacienteForm: React.FC<PacienteFormProps> = ({ visible, paciente, onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [numero, setNumero] = useState('');
  
  // Novo estado para controlar a mensagem de erro na tela
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Limpa os erros sempre que abrir ou fechar o modal
    setErrorMessage('');
    
    if (paciente) {
      setNome(paciente.nome);
      setEmail(paciente.email);
      setIdade(paciente.idade);
      setNumero(paciente.numero.replace(/\D/g, ''));
    } else {
      setNome('');
      setEmail('');
      setIdade('');
      setNumero('');
    }
  }, [paciente, visible]);

  const handleSave = () => {
    // Limpa erros anteriores ao tentar salvar de novo
    setErrorMessage('');

    if (!nome.trim() || !email.trim() || !idade.trim() || !numero.trim()) {
      setErrorMessage('⚠️ Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('❌ E-mail Inválido. Use um formato válido (ex: nome@email.com).');
      return;
    }

    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 100) {
      setErrorMessage('❌ Idade Inválida. O paciente não pode ter mais de 100 anos.');
      return;
    }

    if (numero.length !== 11) {
      setErrorMessage('❌ Número Inválido. Deve conter exatamente 11 dígitos.');
      return;
    }

    const ddd = numero.substring(0, 2);
    const primeiraParte = numero.substring(2, 7);
    const segundaParte = numero.substring(7, 11);
    const numeroFormatado = `${ddd} ${primeiraParte}-${segundaParte}`;

    onSave(nome.trim(), email.trim(), idadeNum.toString(), numeroFormatado);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>{paciente ? 'Editar Paciente' : 'Novo Paciente'}</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Nome completo" 
              value={nome} 
              onChangeText={setNome} 
              placeholderTextColor="#999" 
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="E-mail" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholderTextColor="#999" 
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="Idade (Max 100)" 
              value={idade} 
              onChangeText={(text) => setIdade(text.replace(/\D/g, ''))} 
              keyboardType="numeric" 
              placeholderTextColor="#999" 
              maxLength={3} 
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="DDD + Número (11 dígitos)" 
              value={numero} 
              onChangeText={(text) => setNumero(text.replace(/\D/g, ''))} 
              keyboardType="numeric" 
              placeholderTextColor="#999" 
              maxLength={11} 
            />

            {/* Mensagem de Erro Visual que aparece direto na tela */}
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f8f6ff', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, color: '#1a1a2e', borderWidth: 1, borderColor: '#e0e0e0' },
  errorContainer: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  saveButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#6c3ce0', alignItems: 'center' },
  saveText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});