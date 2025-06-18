import { View, Text, ScrollView, Pressable } from 'react-native';
import PricingInput from './PricingInput';

interface PricingOption {
  amount: string;
  type: string;
  unit: string;
  negotiable: boolean;
}

interface PricingInputListProps {
  pricingList: PricingOption[];
  setPricingList: React.Dispatch<React.SetStateAction<PricingOption[]>>;
}

const PricingInputList: React.FC<PricingInputListProps> = ({ pricingList, setPricingList }) => {
  const handleChange = (index: number, key: keyof PricingOption, value: string | boolean) => {
    const updated = [...pricingList];
    updated[index][key] = value;
    setPricingList(updated);
  };

  const handleAdd = () => {
    setPricingList([
      ...pricingList,
      { amount: '', type: '', unit: '', negotiable: true },
    ]);
  };

  const handleRemove = (index) => {
    const updated = pricingList.filter((_, i) => i !== index);
    setPricingList(updated);
  };

  return (
    <View className="mt-6">
      <Text className="text-lg font-bold text-gray-800 mb-3">Pricing Options</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {pricingList.map((item, index) => (
          <View
            key={index}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 mx-2 w-[320px]"
          >
            <PricingInput
              amount={item.amount}
              setAmount={(value) => handleChange(index, 'amount', value)}
              type={item.type}
              setType={(value) => handleChange(index, 'type', value)}
              unit={item.unit}
              setUnit={(value) => handleChange(index, 'unit', value)}
              negotiable={item.negotiable}
              setNegotiable={(value) => handleChange(index, 'negotiable', value)}
            />

            {pricingList.length > 1 && (
              <Pressable
                onPress={() => handleRemove(index)}
                className="mt-3 rounded-lg bg-red-100 px-4 py-2"
              >
                <Text className="text-red-600 text-center font-semibold">Remove</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      <Pressable
        onPress={handleAdd}
        className="bg-blue-600 rounded-xl py-3 px-6 w-[95%] max-w-[400px] self-center shadow-sm"
      >
        <Text className="text-white font-semibold text-center text-base">
          Add Pricing Option
        </Text>
      </Pressable>
    </View>
  );
};

export default PricingInputList;
