import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoBorderRadius, EcoTypography, EcoSpacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { uploadBill } from '@/services/bills.api';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  // İzin yoksa
  if (!permission) {
    return <View style={styles.root} />;
  }
  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.permissionScreen]}>
        <Ionicons name="camera-outline" size={64} color={theme.muted} />
        <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
        <Text style={styles.permissionText}>
          Faturanı fotoğraflamak için kamera iznine ihtiyacımız var.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) setCapturedUri(photo.uri);
  }

  async function handleGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setCapturedUri(result.assets[0].uri);
    }
  }

  async function handleUpload() {
    if (!capturedUri) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('bill', {
        uri: capturedUri,
        type: 'image/jpeg',
        name: 'bill.jpg',
      } as any);

      const extracted = await uploadBill(formData);
      // Review ekranına parametrelerle geç
      router.push({
        pathname: '/bill/review',
        params: { data: JSON.stringify(extracted), imageUri: capturedUri },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        'Fatura okunamadı. Daha net bir fotoğraf çekmeyi deneyin.';
      Alert.alert('Hata', msg);
      setCapturedUri(null);
    } finally {
      setIsUploading(false);
    }
  }

  // Çekim sonrası onay ekranı
  if (capturedUri) {
    return (
      <View style={styles.root}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />
        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Faturayı net görüyor musun?</Text>
        </View>

        {/* Alt butonlar */}
        <View style={[styles.previewActions, { paddingBottom: insets.bottom + EcoSpacing.md }]}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => setCapturedUri(null)}
            disabled={isUploading}
          >
            <Ionicons name="refresh" size={20} color={theme.text} />
            <Text style={styles.retakeBtnText}>Tekrar Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.useBtn, isUploading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.useBtnText}>Analiz Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing}>
        {/* Üst bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + EcoSpacing.sm }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Fatura Çek</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Çerçeve kılavuzu */}
        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={styles.frameHint}>Faturayı çerçeve içine hizala</Text>
        </View>

        {/* Alt bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + EcoSpacing.md }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleGallery}>
            <Ionicons name="images-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const FRAME_SIZE = width * 0.85;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  permissionScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: EcoSpacing.xl,
    backgroundColor: theme.bg,
  },
  permissionTitle: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
    marginTop: EcoSpacing.lg,
    marginBottom: EcoSpacing.sm,
  },
  permissionText: {
    fontSize: EcoTypography.sizes.base,
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: EcoSpacing.xl,
  },
  permissionBtn: {
    backgroundColor: EcoColors.primary,
    borderRadius: EcoBorderRadius.sm,
    paddingVertical: EcoSpacing.md,
    paddingHorizontal: EcoSpacing.xl,
    marginBottom: EcoSpacing.md,
  },
  permissionBtnText: {
    color: '#fff',
    fontWeight: EcoTypography.weights.bold,
    fontSize: EcoTypography.sizes.md,
  },
  closeBtn: { padding: EcoSpacing.sm },
  closeBtnText: { color: theme.muted, fontSize: EcoTypography.sizes.base },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EcoSpacing.md,
    paddingBottom: EcoSpacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBarTitle: {
    color: '#fff',
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.semibold,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: EcoColors.primary,
  },
  cornerTL: {
    top: '15%',
    left: (width - FRAME_SIZE) / 2,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: '15%',
    right: (width - FRAME_SIZE) / 2,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: '15%',
    left: (width - FRAME_SIZE) / 2,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: '15%',
    right: (width - FRAME_SIZE) / 2,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  frameHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: EcoTypography.sizes.sm,
    marginTop: '30%',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: EcoSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    color: '#fff',
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.semibold,
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: EcoSpacing.lg,
    gap: EcoSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: EcoSpacing.md,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EcoSpacing.xs,
    height: 50,
    borderRadius: EcoBorderRadius.sm,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  retakeBtnText: {
    color: theme.text,
    fontWeight: EcoTypography.weights.semibold,
  },
  useBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EcoSpacing.xs,
    height: 50,
    borderRadius: EcoBorderRadius.sm,
    backgroundColor: EcoColors.primary,
  },
  useBtnText: {
    color: '#fff',
    fontWeight: EcoTypography.weights.bold,
  },
});
