import { View, Text, TextInput, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect } from 'react';

interface PricingInputProps {
    amount: string;
    setAmount: (value: string) => void;
    type: string;
    setType: (value: string) => void;
    unit: string;
    setUnit: (value: string) => void;
    negotiable: boolean;
    setNegotiable: (value: boolean) => void;
}

const typeToUnit: Record<string, string> = {
    rent_monthly: 'month',
    rent_yearly: 'year',
    buy: 'total',
    lease_custom: 'month',
    short_stay: 'night',
};

const PricingInput: React.FC<PricingInputProps> = ({
    amount,
    setAmount,
    type,
    setType,
    unit,
    setUnit,
    negotiable,
    setNegotiable,
}) => {
    useEffect(() => {
        if (type && typeToUnit[type]) {
            setUnit(typeToUnit[type]);
        }
    }, [type]);

    return (
        <View className="bg-white rounded-2xl shadow-md px-4 py-4 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Pricing</Text>

            {/* Amount */}
            <Text className="text-sm text-gray-600 mb-1">Amount</Text>
            <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 mb-3"
                placeholder="e.g. 25000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />

            {/* Type */}
            <Text className="text-sm text-gray-600 mb-1">Type</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50 mb-3 overflow-hidden">
                <Picker selectedValue={type} onValueChange={setType} style={{ height: 52 }}>
                    <Picker.Item label="Select Type" value="" />
                    <Picker.Item label="Rent Monthly" value="rent_monthly" />
                    <Picker.Item label="Rent Yearly" value="rent_yearly" />
                    <Picker.Item label="Buy" value="buy" />
                    <Picker.Item label="Lease Custom" value="lease_custom" />
                    <Picker.Item label="Short Stay" value="short_stay" />
                </Picker>
            </View>

            {/* Negotiable */}
            <View className="flex-row justify-between items-center mt-1">
                <Text className="text-sm text-gray-600">Negotiable</Text>
                <Switch value={negotiable} onValueChange={setNegotiable} />
            </View>
        </View>

    );
};

export default PricingInput;
