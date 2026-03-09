import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/StepIndicator';
import { addressApi } from '../../api/client';

type AddressItem = {
  address: string;
  jibunAddress: string;
  zipCode: string;
  buildingName: string;
};

type Props = NativeStackScreenProps<HomeStackParamList, 'GuestInfo'>;

export function GuestInfoScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();
  const scrollViewRef = useRef<ScrollView>(null);
  const [privacyChecked, setPrivacyChecked] = useState(formData.privacyConsent);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<AddressItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addressSelected, setAddressSelected] = useState(!!formData.guestAddress);

  async function handleAddressSearch() {
    const keyword = searchKeyword.trim();
    if (!keyword) return;

    setSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setErrors((prev) => { const { address, ...rest } = prev; return rest; });

    try {
      const result = await addressApi.search(keyword);
      if (!result.success) {
        setSearchResults([]);
        setErrors((prev) => ({ ...prev, address: result.message || '검색 결과가 없습니다.' }));
        return;
      }
      const items = result.items || [];
      if (items.length === 1) {
        selectAddress(items[0]);
      } else {
        setSearchResults(items);
      }
    } catch (err) {
      console.warn('Address search error:', err);
      setSearchResults([]);
      setErrors((prev) => ({ ...prev, address: '주소 검색 중 오류가 발생했습니다. 네트워크를 확인해주세요.' }));
    } finally {
      setSearching(false);
    }
  }

  function selectAddress(item: AddressItem) {
    const display = item.buildingName
      ? `${item.address} (${item.buildingName})`
      : item.address;
    updateFormData({ guestAddress: display });
    setAddressSelected(true);
    setSearchResults([]);
  }

  function handleResetSearch() {
    setAddressSelected(false);
    setSearchKeyword('');
    setSearchResults([]);
    setHasSearched(false);
    updateFormData({ guestAddress: '' });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    const phoneClean = formData.guestPhone.replace(/\D/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      newErrors.phone = '올바른 전화번호를 입력해주세요';
    }

    if (!formData.guestAddress.trim()) {
      newErrors.address = '주소를 검색하여 선택해주세요';
    }

    if (!privacyChecked) {
      newErrors.privacy = '개인정보 수집·이용에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    updateFormData({ privacyConsent: privacyChecked });
    navigation.navigate('ServiceSelect');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="이름"
            required
            placeholder="이름을 입력하세요"
            value={formData.guestName}
            onChangeText={(text) => updateFormData({ guestName: text })}
            error={errors.name}
          />

          <Input
            label="전화번호"
            required
            placeholder="010-0000-0000"
            value={formData.guestPhone}
            onChangeText={(text) => updateFormData({ guestPhone: text })}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          {/* 주소 검색 */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              주소 <Text style={styles.required}>*</Text>
            </Text>

            {addressSelected ? (
              <View>
                <View style={styles.selectedAddressBox}>
                  <Text style={styles.selectedAddressText} numberOfLines={2}>
                    {formData.guestAddress}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.reSearchButton}
                  onPress={handleResetSearch}
                >
                  <Text style={styles.reSearchButtonText}>다시 검색</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="도로명, 건물명 또는 지번 입력"
                    placeholderTextColor={Colors.textLight}
                    value={searchKeyword}
                    onChangeText={setSearchKeyword}
                    onSubmitEditing={handleAddressSearch}
                    returnKeyType="search"
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleAddressSearch}
                    disabled={searching}
                  >
                    {searching ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.searchButtonText}>검색</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {searching && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>검색 중...</Text>
                  </View>
                )}

                {!searching && hasSearched && searchResults.length === 0 && !errors.address && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      검색 결과가 없습니다. 다른 검색어를 입력해주세요.
                    </Text>
                  </View>
                )}

                {searchResults.length > 0 && (
                  <View style={styles.resultList}>
                    {searchResults.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.resultItem}
                        onPress={() => selectAddress(item)}
                      >
                        <Text style={styles.resultAddress}>{item.address}</Text>
                        {item.buildingName ? (
                          <Text style={styles.resultBuilding}>
                            {item.buildingName}
                          </Text>
                        ) : null}
                        <Text style={styles.resultJibun}>
                          [지번] {item.jibunAddress}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>

          <Input
            label="상세주소"
            placeholder="상세주소를 입력하세요"
            value={formData.guestAddressDetail}
            onChangeText={(text) =>
              updateFormData({ guestAddressDetail: text })
            }
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />

          {/* Privacy Consent */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setPrivacyChecked(!privacyChecked)}
          >
            <View
              style={[
                styles.checkboxBox,
                privacyChecked && styles.checkboxChecked,
              ]}
            >
              {privacyChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>개인정보 수집·이용 동의</Text>
          </TouchableOpacity>
          {errors.privacy && (
            <Text style={styles.errorText}>{errors.privacy}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button title="다음 →" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  emptyBox: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
  resultList: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 44,
  },
  resultAddress: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  resultBuilding: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  resultJibun: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  selectedAddressBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectedAddressText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  reSearchButton: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  reSearchButtonText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 44,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
