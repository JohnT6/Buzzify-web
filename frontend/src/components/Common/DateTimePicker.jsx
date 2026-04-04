import React, { useState, useEffect, useRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import { Calendar, Clock, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import './DateTimePicker.css';
import { cn } from '../../lib/utils';

registerLocale('vi', vi);

const DateTimePicker = ({ selected, onChange, placeholderText = "Chọn ngày và giờ", minDate = new Date() }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('date'); // 'date' | 'time'
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setStep('date');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date) => {
    onChange(date);
    setStep('time');
  };

  const handleTimeSelect = (date) => {
    onChange(date);
  };

  const handleManualHourChange = (h) => {
    const newDate = new Date(selected || new Date());
    let val = parseInt(h);
    if (isNaN(val)) val = 0;
    if (val > 23) val = 23;
    if (val < 0) val = 0;
    newDate.setHours(val);
    onChange(newDate);
  };

  const handleManualMinuteChange = (m) => {
    const newDate = new Date(selected || new Date());
    let val = parseInt(m);
    if (isNaN(val)) val = 0;
    if (val > 59) val = 59;
    if (val < 0) val = 0;
    newDate.setMinutes(val);
    onChange(newDate);
  };

  const handleDone = () => {
    setIsOpen(false);
    setStep('date');
  };

  return (
    <div className="custom-datetime-container" ref={containerRef}>
      <div className="relative group">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-3 bg-white border shadow-sm rounded-2xl transition-all font-medium text-gray-800 cursor-pointer pr-10 flex items-center justify-between",
            isOpen ? "ring-2 ring-blue-500/20 border-blue-400" : "border-gray-200 hover:border-gray-300"
          )}
        >
          <span className={!selected ? "text-gray-400" : ""}>
            {selected ? (
                new Intl.DateTimeFormat('vi-VN', { 
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit' 
                }).format(selected)
            ) : placeholderText}
          </span>
          <Calendar size={18} className="text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 z-[110] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[320px]">
            {/* Header Steps */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", step === 'date' ? "bg-blue-600" : "bg-gray-200")} />
                    <div className={cn("w-2 h-2 rounded-full", step === 'time' ? "bg-blue-600" : "bg-gray-200")} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {step === 'date' ? 'Bước 1: Chọn Ngày' : 'Bước 2: Chọn Giờ'}
                </span>
            </div>

            {step === 'date' ? (
                <div className="step-content animate-in slide-in-from-left-2 duration-300">
                    <DatePicker
                        selected={selected}
                        onChange={handleDateSelect}
                        inline
                        minDate={minDate}
                        locale="vi"
                        calendarClassName="buzzify-inline-calendar"
                        nextMonthButtonLabel={<ChevronRight size={16} />}
                        previousMonthButtonLabel={<ChevronLeft size={16} />}
                    />
                </div>
            ) : (
                <div className="step-content animate-in slide-in-from-right-2 duration-300 flex flex-col items-center">
                    <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4 text-center border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ngày đã chọn</p>
                        <p className="text-sm font-bold text-blue-600">
                            {selected && new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selected)}
                        </p>
                    </div>

                    {/* Manual Time Input Section */}
                    <div className="w-full flex flex-col items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoặc nhập giờ chính xác</span>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <div className="flex flex-col items-center gap-1">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="23" 
                                    value={selected ? selected.getHours() : 0}
                                    onChange={(e) => handleManualHourChange(e.target.value)}
                                    className="w-14 h-12 text-center bg-white border border-gray-200 rounded-xl font-bold text-lg text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Giờ</span>
                            </div>
                            <span className="text-xl font-bold text-gray-300 mb-4">:</span>
                            <div className="flex flex-col items-center gap-1">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="59" 
                                    value={selected ? selected.getMinutes() : 0}
                                    onChange={(e) => handleManualMinuteChange(e.target.value)}
                                    className="w-14 h-12 text-center bg-white border border-gray-200 rounded-xl font-bold text-lg text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Phút</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="time-picker-wrapper w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-inner">
                        <DatePicker
                            selected={selected}
                            onChange={handleTimeSelect}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Chọn giờ"
                            dateFormat="HH:mm"
                            inline
                            locale="vi"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full mt-4">
                        <button 
                            onClick={() => setStep('date')}
                            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>
                        <button 
                            onClick={handleDone}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Xong <Check size={14} />
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;
