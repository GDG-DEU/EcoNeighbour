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
  Image,
  ScrollView,
} from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoBorderRadius, EcoTypography, EcoSpacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { uploadBill } from '@/services/bills.api';
import { AnimatedButton, ProgressCircle, SuccessCheckmark, FadeInSlide } from '@/animations';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
    setUploadSuccess(false);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('bill', {
        uri: capturedUri,
        type: 'image/jpeg',
        name: 'bill.jpg',
      } as any);

      const extracted = await uploadBill(formData);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Wait for success animation
      setTimeout(() => {
        router.push({
          pathname: '/bill/review',
          params: { data: JSON.stringify(extracted), imageUri: capturedUri },
        });
      }, 1500);
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
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a' }]} />
        
        {/* Üst Gradient Bar */}
        <View style={[styles.previewTopBar, { paddingTop: insets.top + EcoSpacing.sm }]}>
          <TouchableOpacity 
            style={styles.closeIconBtn} 
            onPress={() => setCapturedUri(null)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Fatura Önizlemesi</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={[
            styles.previewScrollContent,
            { paddingBottom: insets.bottom + EcoSpacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Preview Container */}
          <FadeInSlide 
            direction="down" 
            distance={60} 
            duration={500} 
            style={styles.animatedPreviewWrapper}
          >
            <View style={styles.previewCardContainer}>
              {/* Image Container with Border */}
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: capturedUri }} 
                  style={styles.billImage}
                />
                
                {/* Glossy Overlay */}
                <View style={styles.glossyOverlay} />
                
                {/* Corner Badges */}
                <View style={[styles.cornerBadge, styles.cornerBadgeTL]}>
                  <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                </View>
                <View style={[styles.cornerBadge, styles.cornerBadgeTR]}>
                  <Text style={styles.qualityBadge}>HD</Text>
                </View>
              </View>

              {/* Info Card Below Image */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoBadge}>
                    <Ionicons name="document-outline" size={16} color={EcoColors.primary} />
                    <Text style={styles.infoBadgeText}>Fatura Tespit Edildi</Text>
                  </View>
                </View>
                
                <Text style={styles.infoLabel}>Kontrol Edin</Text>
                <Text style={styles.infoDescription}>
                  Faturanın tamamı göze çarptığından ve metinler net göründüğünden emin olun.
                </Text>

                {/* Checklist */}
                <View style={styles.checklistContainer}>
                  <View style={styles.checklistItem}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                    <Text style={styles.checklistText}>Fatura tamamen görünüyor</Text>
                  </View>
                  <View style={styles.checklistItem}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                    <Text style={styles.checklistText}>Metinler net ve okunabilir</Text>
                  </View>
                  <View style={styles.checklistItem}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                    <Text style={styles.checklistText}>Aydınlatma yeterli</Text>
                  </View>
                </View>
              </View>
            </View>
          </FadeInSlide>

          {/* Action Buttons */}
          {!isUploading && !uploadSuccess && (
            <FadeInSlide 
              direction="up" 
              distance={60} 
              duration={500} 
              delay={200}
              style={styles.previewActions}
            >
              <AnimatedButton
                onPress={() => setCapturedUri(null)}
                disabled={isUploading}
                style={styles.retakeBtn}
              >
                <View style={styles.retakeBtnContent}>
                  <Ionicons name="refresh" size={22} color={EcoColors.primary} />
                  <Text style={styles.retakeBtnText}>Tekrar Çek</Text>
                </View>
              </AnimatedButton>

              <AnimatedButton
                onPress={handleUpload}
                disabled={isUploading}
                style={styles.useBtn}
              >
                <View style={styles.useBtnContent}>
                  <Ionicons name="rocket" size={22} color="#fff" />
                  <Text style={styles.useBtnText}>Analiz Et</Text>
                </View>
              </AnimatedButton>
            </FadeInSlide>
          )}
        </ScrollView>

        {/* Upload Progress or Success Overlay */}
        {isUploading || uploadSuccess ? (
          <View style={styles.uploadOverlay}>
            <FadeInSlide direction="up" distance={40} duration={400} style={styles.uploadStateContainer}>
              <View style={styles.uploadStateContent}>
                {uploadSuccess ? (
                  <>
                    <SuccessCheckmark
                      size={80}
                      color="#22c55e"
                      onAnimationComplete={() => {}}
                    />
                    <Text style={styles.uploadStateTitle}>Analiz Tamamlandı!</Text>
                    <Text style={styles.uploadStateSubtitle}>
                      Faturanız başarıyla işlendi
                    </Text>
                  </>
                ) : (
                  <>
                    <ProgressCircle
                      progress={uploadProgress}
                      size={120}
                      progressColor={EcoColors.primary}
                    />
                    <Text style={styles.uploadStateTitle}>Analiz Ediliyor...</Text>
                    <Text style={styles.uploadStateSubtitle}>
                      Lütfen bekleyin
                    </Text>
                  </>
                )}
              </View>
            </FadeInSlide>
          </View>
        ) : null}

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

          <AnimatedButton style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnInner} />
          </AnimatedButton>

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
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  previewLabel: {
    color: '#fff',
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.semibold,
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EcoSpacing.md,
    paddingBottom: EcoSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  closeIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    color: '#fff',
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.bold,
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    paddingTop: EcoSpacing.lg,
  },
  animatedPreviewWrapper: {
    justifyContent: 'center',
    paddingBottom: EcoSpacing.lg,
  },
  previewCardContainer: {
    marginHorizontal: EcoSpacing.lg,
    borderRadius: EcoBorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 25,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  billImage: {
    width: '100%',
    height: '100%',
    borderRadius: EcoBorderRadius.xl,
  },
  glossyOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  cornerBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
  },
  cornerBadgeTL: {
    top: EcoSpacing.md,
    left: EcoSpacing.md,
  },
  cornerBadgeTR: {
    top: EcoSpacing.md,
    right: EcoSpacing.md,
  },
  qualityBadge: {
    color: EcoColors.primary,
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.bold,
  },
  infoCard: {
    paddingHorizontal: EcoSpacing.lg,
    paddingVertical: EcoSpacing.lg,
    gap: EcoSpacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.xs,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: EcoSpacing.xs,
    paddingHorizontal: EcoSpacing.sm,
    borderRadius: EcoBorderRadius.sm,
  },
  infoBadgeText: {
    color: EcoColors.primary,
    fontSize: EcoTypography.sizes.xs,
    fontWeight: EcoTypography.weights.semibold,
  },
  infoLabel: {
    color: '#fff',
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.bold,
    marginTop: EcoSpacing.sm,
  },
  infoDescription: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.sm,
    lineHeight: 20,
  },
  checklistContainer: {
    marginTop: EcoSpacing.md,
    gap: EcoSpacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.sm,
  },
  checklistText: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.sm,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadStateContent: {
    alignItems: 'center',
    gap: EcoSpacing.lg,
  },
  uploadStateTitle: {
    color: '#fff',
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.bold,
    marginTop: EcoSpacing.lg,
  },
  uploadStateSubtitle: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.sm,
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: EcoSpacing.lg,
    gap: EcoSpacing.md,
    backgroundColor: 'transparent',
  },
  retakeBtn: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: EcoBorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: EcoColors.primary,
    gap: EcoSpacing.sm,
  },
  retakeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.sm,
  },
  retakeBtnText: {
    color: EcoColors.primary,
    fontSize: EcoTypography.sizes.base,
    fontWeight: EcoTypography.weights.semibold,
  },
  useBtn: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: EcoBorderRadius.lg,
    backgroundColor: EcoColors.primary,
    gap: EcoSpacing.sm,
    shadowColor: EcoColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  useBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.sm,
  },
  useBtnText: {
    color: '#fff',
    fontSize: EcoTypography.sizes.base,
    fontWeight: EcoTypography.weights.semibold,
  },
});
