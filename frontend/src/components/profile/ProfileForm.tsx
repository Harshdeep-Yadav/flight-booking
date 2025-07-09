import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useForm } from 'react-hook-form';
import { UserProfile } from '../../types/user';

interface ProfileFormData {
  address: string;
  payment_info: string;
}

/**
 * ProfileForm component
 * @param {UserProfile} profile - Current profile data
 * @param {(data: ProfileFormData) => void} onSave - Save handler
 * @param {boolean} saving - Loading state
 * @param {string} [message] - Success/error message
 */
export const ProfileForm: React.FC<{
  profile: Partial<UserProfile>;
  onSave: (data: ProfileFormData) => void;
  saving: boolean;
  message?: string;
}> = ({ profile, onSave, saving, message }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      address: profile.address || '',
      payment_info: profile.payment_info ? JSON.stringify(profile.payment_info) : '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-2 mb-8">
      <Input 
        label="Address" 
        {...register('address', { 
          required: "Address is required",
          minLength: { value: 10, message: "Address must be at least 10 characters" }
        })} 
        placeholder='Enter your address' 
        error={errors.address?.message as string} 
        required 
      />
      <Input 
        label="Payment Info" 
        {...register('payment_info', {
          validate: (value) => {
            if (!value) return true; // Optional field
            try {
              JSON.parse(value);
              return true;
            } catch {
              return "Invalid JSON format";
            }
          }
        })} 
        error={errors.payment_info?.message as string} 
        placeholder='Enter your payment info' 
      />
      <Button type="submit" loading={saving}>Save Profile</Button>
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </form>
  );
}; 