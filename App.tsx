
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  HeartPulse, BookOpen, Camera, MapPin, 
  AlertTriangle, CheckCircle, Info, Upload, 
  Send, Loader2, ChevronRight, X, Search,
  ShoppingCart, Hospital, FileText,
  Stethoscope, MessageSquare, RefreshCcw,
  ExternalLink, ShieldCheck, School, ChevronLeft,
  Users, Activity, Zap, Eye, Pill, Map as MapIcon
} from 'lucide-react';
import { UrgencyLevel, HealthCase, HealbookTopic, UserRole, ChatMessage } from './types';
import { GoogleGenAI, Type } from "@google/genai";

// Declare Leaflet globally since it's loaded via script tag
declare var L: any;

const HEALBOOK_DATA: HealbookTopic[] = [
  {
    id: 'da-1',
    category: 'DA LIÊU',
    title: 'Chốc lở (Impetigo) - Nhiễm trùng da học đường',
    shortDescription: 'Chốc lở là một bệnh nhiễm trùng da do vi khuẩn (thường là tụ cầu hoặc liên cầu) rất phổ biến ở trẻ em và học sinh tiểu học. Bệnh đặc trưng bởi các vết loét đỏ, mụn nước nông, khi vỡ tạo thành lớp vảy màu vàng óng như mật ong. Vị trí thường gặp nhất là quanh mũi, miệng, nhưng có thể lan sang tay, chân hoặc các vùng da khác qua tiếp xúc trực tiếp hoặc dùng chung đồ dùng cá nhân.',
    educationalImages: [
      {
        url: 'https://tse1.explicit.bing.net/th/id/OIP.m-LtfDDZ65WVSBhlJPqEYwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
        caption: 'Hình ảnh minh họa: Vết loét đóng vảy màu vàng mật ong điển hình của bệnh chốc lở.'
      },
      {
        url: 'https://www.webmd.com/skin-problems-and-treatments/impetigo/ss/slideshow-impetigo-overview',
        caption: 'Hình ảnh minh họa: Các vết trợt nông với lớp vảy tiết đặc trưng trên da mặt.'
      },
      {
        url: 'https://www.mayoclinic.org/-/media/kcms/gbs%20patient%20consumer/images/2013/08/26/10/20/ds00464_im00575_r7_impetigothu_jpg.jpg',
        caption: 'Hình ảnh minh họa: Tổn thương chốc lở thường xuất hiện quanh vùng mũi và miệng.'
      }
    ],
    commonSigns: [
      'Bắt đầu bằng một nốt đỏ hoặc mụn nước nhỏ dễ vỡ.',
      'Dịch từ mụn nước khô lại tạo thành vảy dày màu vàng hoặc nâu nhạt.',
      'Vùng da xung quanh có thể bị đỏ, sưng nhẹ và gây ngứa ngáy khó chịu.',
      'Dễ lan rộng nếu trẻ gãi và chạm vào các vùng da lành khác.'
    ],
    schoolContext: 'Trong môi trường trường học, vi khuẩn lây lan cực nhanh qua việc chạm tay trực tiếp vào vết thương, dùng chung khăn lau tay, gối ngủ bán trú, hoặc đồ chơi chung. Điều kiện vệ sinh kém hoặc thời tiết nóng ẩm là yếu tố thuận lợi để vi khuẩn phát triển mạnh.',
    dangerSigns: [
      'Vết loét lan rộng nhanh chóng mặc dù đã vệ sinh.',
      'Học sinh bị sốt cao, mệt mỏi, bỏ ăn.',
      'Vùng da tổn thương bị sưng nóng, đỏ rực và rất đau khi chạm vào.',
      'Xuất hiện các hạch sưng đau ở vùng lân cận (cổ, nách).'
    ],
    safeActions: [
      'Rửa vết loét nhẹ nhàng 2 lần/ngày bằng nước muối sinh lý hoặc dung dịch sát khuẩn nhẹ.',
      'Sử dụng khăn giấy dùng một lần để thấm dịch, tránh dùng khăn vải dùng chung.',
      'Cắt ngắn móng tay để tránh trẻ gãi gây nhiễm trùng sâu hơn.',
      'Cho trẻ nghỉ học tạm thời cho đến khi các vết loét khô hẳn để tránh lây lan cho bạn bè.'
    ],
    references: [{ title: 'Hướng dẫn Bộ Y tế về Da liễu', url: 'https://moh.gov.vn' }],
    samplePrompt: 'Quan sát thấy vùng quanh miệng trẻ có các vết trợt đóng vảy vàng khô.'
  },
  {
    id: 'tcm-1',
    category: 'TRUYỀN NHIỄM',
    title: 'Tay-Chân-Miệng (HFMD) - Dịch bệnh tiêu hóa học đường',
    shortDescription: 'Bệnh Tay-Chân-Miệng là bệnh truyền nhiễm cấp tính do virus thuộc nhóm Enterovirus gây ra, phổ biến nhất là Coxsackievirus A16 và Enterovirus 71 (EV71). Bệnh lây lan chủ yếu qua đường tiêu hóa và tiếp xúc trực tiếp với dịch tiết mũi họng, nước bọt, hoặc dịch phỏng nước của người bệnh. Đây là nỗi lo lớn tại các trường mầm non và tiểu học vì khả năng gây dịch nhanh và nguy cơ biến chứng thần kinh, tim mạch nếu không được phát hiện kịp thời.',
    educationalImages: [
      {
        url: 'https://benhviennhitrunguong.gov.vn/wp-content/uploads/2018/10/HandFootandMouth2-1.jpg',
        caption: 'Hình ảnh minh họa: Nốt phỏng nước đặc trưng ở lòng bàn tay và bàn chân.'
      },
      {
        url: 'https://www.webmd.com/children/ss/slideshow-hand-foot-mouth-disease',
        caption: 'Hình ảnh minh họa: Vết loét đau trong niêm mạc miệng khiến trẻ khó ăn uống.'
      },
      {
        url: 'https://www.mayoclinic.org/-/media/kcms/gbs%20patient%20consumer/images/2013/08/26/10/20/ds00470_im00576_r7_hfmdthu_jpg.jpg',
        caption: 'Hình ảnh minh họa: Tổn thương phỏng nước ở bàn chân và vùng mông.'
      }
    ],
    commonSigns: [
      'Sốt nhẹ, mệt mỏi, đau họng, chảy nước mũi trong 1-2 ngày đầu.',
      'Loét miệng: Các nốt đỏ xuất hiện ở lợi, lưỡi, niêm mạc miệng khiến trẻ đau khi ăn, chảy dãi nhiều.',
      'Phỏng nước: Xuất hiện ở lòng bàn tay, lòng bàn chân, mông, gối. Nốt phỏng thường không ngứa, không đau.',
      'Trẻ thường quấy khóc, bỏ ăn do các vết loét trong miệng gây đau đớn.'
    ],
    schoolContext: 'Virus tồn tại rất lâu trên các bề mặt như bàn ghế, đồ chơi, tay nắm cửa. Học sinh lây cho nhau qua việc ăn uống chung, vệ sinh cá nhân không sạch sẽ hoặc chạm vào dịch tiết của bạn bị bệnh.',
    dangerSigns: [
      'Sốt cao liên tục trên 39 độ C và không đáp ứng với thuốc hạ sốt.',
      'Trẻ có biểu hiện giật mình, run tay chân, hoặc quấy khóc vô cớ khi ngủ.',
      'Đi đứng loạng choạng, nôn ói nhiều, hoặc khó thở.',
      'Mạch nhanh, da nổi vân tím hoặc vã mồ hôi lạnh.'
    ],
    safeActions: [
      'Cách ly trẻ tại nhà ngay khi có dấu hiệu nghi ngờ.',
      'Cho trẻ ăn đồ ăn lỏng, mềm, nguội (cháo, súp) để tránh kích ứng vết loét miệng.',
      'Thực hiện vệ sinh tay thường xuyên cho cả trẻ và người chăm sóc.',
      'Khử khuẩn đồ dùng cá nhân và môi trường xung quanh bằng dung dịch Cloramin B.'
    ],
    references: [{ title: 'Cổng thông tin CDC Việt Nam', url: 'https://vncdc.gov.vn' }],
    samplePrompt: 'Trẻ bị sốt nhẹ, đau miệng bỏ ăn và có nốt đỏ ở lòng bàn tay.'
  },
  {
    id: 'mat-1',
    category: 'MẮT',
    title: 'Viêm kết mạc (Đau mắt đỏ) - Viêm nhiễm lây lan nhanh',
    shortDescription: 'Đau mắt đỏ là tình trạng viêm lớp màng trong suốt bao phủ lòng trắng mắt và mặt trong mi mắt. Bệnh thường do virus (Adenovirus là phổ biến nhất) hoặc vi khuẩn gây ra. Đau mắt đỏ cực kỳ dễ lây lan qua tiếp xúc trực tiếp hoặc gián tiếp với dịch tiết từ mắt người bệnh. Trong trường học, một ca đau mắt đỏ có thể nhanh chóng bùng phát thành dịch nếu không có các biện pháp phòng ngừa nghiêm ngặt.',
    educationalImages: [
      {
        url: 'https://www.matsaigon.com/wp-content/uploads/viem-ket-mac-3.jpg',
        caption: 'Hình ảnh minh họa: Lòng trắng mắt đỏ rực kèm sưng mi mắt và chảy nước mắt.'
      },
      {
        url: 'https://www.webmd.com/eye-health/ss/slideshow-pink-eye',
        caption: 'Hình ảnh minh họa: Viêm kết mạc với nhiều ghèn dính chặt ở mi mắt.'
      },
      {
        url: 'https://www.mayoclinic.org/-/media/kcms/gbs%20patient%20consumer/images/2013/08/26/10/20/ds00384_im00573_r7_conjuncdthu_jpg.jpg',
        caption: 'Hình ảnh minh họa: Trẻ em bị viêm kết mạc với triệu chứng điển hình.'
      }
    ],
    commonSigns: [
      'Lòng trắng mắt đỏ rực (đỏ tươi hoặc hồng).',
      'Cảm giác cộm, rát như có cát trong mắt.',
      'Ghèn (dử) mắt nhiều, có thể màu trắng trong hoặc vàng xanh, gây dính mi mắt vào buổi sáng.',
      'Chảy nước mắt nhiều, mắt sưng húp và nhạy cảm với ánh sáng.'
    ],
    schoolContext: 'Lây lan qua việc học sinh dùng chung khăn mặt, gối, kính mắt, hoặc chạm tay vào dịch tiết mắt của người bệnh rồi đưa lên mắt mình. Sử dụng hồ bơi chung tại trường cũng là một kênh lây truyền tiềm ẩn.',
    dangerSigns: [
      'Đau nhức mắt dữ dội, cảm giác đau sâu vào trong hốc mắt.',
      'Nhìn mờ, suy giảm thị lực đột ngột.',
      'Mắt rất sợ ánh sáng, không thể mở mắt tự nhiên.',
      'Chảy mủ đặc hoặc có máu từ kết mạc.'
    ],
    safeActions: [
      'Nhỏ nước muối sinh lý (NaCl 0.9%) thường xuyên để làm sạch dịch tiết.',
      'Rửa tay bằng xà phòng ngay sau khi chăm sóc mắt bị bệnh.',
      'Tuyệt đối không dùng chung vật dụng cá nhân (khăn, gối, thuốc nhỏ mắt).',
      'Đeo kính mát để giảm kích ứng ánh sáng và hạn chế trẻ đưa tay lên dụi mắt.'
    ],
    references: [{ title: 'Bệnh viện Mắt Trung ương', url: 'https://vnio.vn' }],
    samplePrompt: 'Mắt bị đỏ rực, chảy nước mắt và có nhiều ghèn vàng dính mi.'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'healbook' | 'aiscan' | 'findcare'>('healbook');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HealbookTopic | null>(null);
  
  // AI Scan State
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<HealthCase | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Find Care State
  const [mapMode, setMapMode] = useState<'idle' | 'hospital' | 'pharmacy'>('idle');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Chatbot state
  const [showChat, setShowChat] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and handle Leaflet Map
  useEffect(() => {
    if (activeTab === 'findcare' && mapMode !== 'idle' && mapContainerRef.current) {
      if (!mapRef.current) {
        const initialLat = location?.lat || 21.0285;
        const initialLng = location?.lng || 105.8542;
        
        mapRef.current = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([initialLat, initialLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
      } else {
        // Clear existing markers
        mapRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapRef.current.removeLayer(layer);
          }
        });
      }

      const center = location ? [location.lat, location.lng] : [21.0285, 105.8542];
      
      // User Marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(center, { icon: userIcon }).addTo(mapRef.current).bindPopup("Vị trí của bạn").openPopup();

      // Add Place Markers
      const count = mapMode === 'hospital' ? 4 : 5;
      for (let i = 1; i <= count; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.02;
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const lat = (center[0] as number) + offsetLat;
        const lng = (center[1] as number) + offsetLng;

        const iconHtml = mapMode === 'hospital' 
          ? `<div class="hospital-marker hospital-marker-pulse w-10 h-10 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hospital"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg></div>`
          : `<div class="pharmacy-marker w-10 h-10 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pill"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg></div>`;

        const icon = L.divIcon({
          className: 'custom-place-marker',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const label = mapMode === 'hospital' ? `Bệnh viện Đa khoa ${i}` : `Nhà thuốc Pharma ${i}`;
        L.marker([lat, lng], { icon }).addTo(mapRef.current).bindPopup(`<div class="font-bold text-xs uppercase">${label}</div><div class="text-[10px] text-slate-500 font-bold">Cách ~${(Math.sqrt(offsetLat**2 + offsetLng**2)*111).toFixed(1)} km</div>`);
      }
    }

    return () => {
      // No cleanup needed usually as we reuse the map ref or it gets garbage collected
    };
  }, [activeTab, mapMode, location]);

  const filteredHealbook = useMemo(() => {
    return HEALBOOK_DATA.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleOpenDetail = (topic: HealbookTopic) => {
    setSelectedTopic(topic);
  };

  const handleUseTopicFromModal = (topic: HealbookTopic) => {
    setSelectedImage(null);
    setInputText(topic.samplePrompt);
    setActiveTab('aiscan');
    setSelectedTopic(null);
    setAiResult(null);
    setShowHeatmap(false);
  };

  const handleFindCare = (type: 'hospital' | 'pharmacy') => {
    setMapMode(type);
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 21.0285, lng: 105.8542 }) // Default Hanoi
      );
    }
  };

  const callAI = async () => {
    if (!inputText && !selectedImage) return;
    setLoading(true);
    setAiResult(null);
    setShowHeatmap(false);
    try {
      const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

      const parts: any[] = [{ 
        text: `Bạn là trợ lý EduHealth AI. Nhiệm vụ: Sàng lọc giáo dục sức khỏe (Truyền nhiễm, Da liễu, Mắt).
        Cấm chẩn đoán xác định. Dùng cụm từ "Gợi ý", "Liên quan", "Khả năng cao là".
        Mô tả: ${inputText}.
        Nếu có ảnh, hãy phân tích kỹ dấu hiệu lâm sàng.` 
      }];
      
      if (selectedImage) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: selectedImage.split(',')[1] } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              analysis: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgency: { type: Type.STRING, enum: Object.values(UrgencyLevel) },
              dangerSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "analysis", "urgency", "dangerSigns", "safetyAdvice"]
          }
        }
      });
      setAiResult(JSON.parse(response.text || '{}'));
    } catch (e) {
      alert("Lỗi kết nối AI. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  const callChat = async (text: string) => {
  console.log("CHATBOT CALLED ✅", text);
  setChatLoading(true);
  setChatMessages(prev => [...prev, { role: "user", content: text }]);

  try {
    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY
    });

    const parts = [{
  text: `Bạn là Trợ lý EduHealth AI – chatbot giáo dục sức khỏe học đường.
KHÔNG chẩn đoán bệnh.
Trả lời dễ hiểu, ngắn gọn.
Luôn nhắc dấu hiệu nguy hiểm cần đi khám.

Câu hỏi của người dùng:
${text}
`
}];
console.log(`TEST TEMPLATE: ${text}`);



    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }]
    });

    const reply =
  (typeof (response as any).text === "function"
    ? (response as any).text()
    : (response as any).text) || 
  (response as any).candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
  "Mình chưa có thông tin phù hợp.";
    console.log("RAW RESPONSE:", response);
    console.log("REPLY:", reply);


    setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
  } catch (e) {
    console.error("CHATBOT ERROR:", e);
    setChatMessages(prev => [...prev, { role: "assistant", content: "Lỗi kết nối." }]);
  } finally {
    setChatLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 font-sans pb-24 selection:bg-blue-100 overflow-x-hidden relative">
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-red { animation: pulse-red 2s infinite; }
        .heatmap-overlay {
          background: radial-gradient(circle at 50% 50%, rgba(255,0,0,0.5) 0%, rgba(255,165,0,0.2) 40%, transparent 70%);
          mix-blend-mode: multiply;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .bg-gradient-to-br {
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(20, 184, 166, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        .floating-shape:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-shape:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .floating-shape:nth-child(3) {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        .floating-shape:nth-child(4) {
          width: 70px;
          height: 70px;
          bottom: 10%;
          right: 10%;
          animation-delay: 1s;
        }
      `}</style>

      {/* Floating Background Elements */}
      <div className="floating-shape"></div>
      <div className="floating-shape"></div>
      <div className="floating-shape"></div>
      <div className="floating-shape"></div>

      {/* Safety Banner */}
      <div className="bg-blue-900 text-white text-[9px] text-center py-2 font-bold uppercase tracking-[0.2em] px-4">
        Hỗ trợ giáo dục & Sàng lọc sức khỏe học đường - Không thay thế chẩn đoán y khoa chuyên nghiệp
      </div>

      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200 rotate-[-5deg] hover:rotate-0 transition-transform cursor-pointer">
              <HeartPulse className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">EduHealth AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dự án được thực hiện bởi đội 43TPU_Powershell and CMD với đề tài Giáo dục chăm sóc sức khỏe con người</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase">Hệ thống sẵn sàng</span>
             </div>
             <button
               onClick={() => setShowChat(true)}
               className="group relative p-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:scale-110 animate-bounce"
               style={{ animation: 'bounce 2s infinite' }}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
               <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative z-10">
                 <MessageSquare size={24} className="text-white drop-shadow-lg" />
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
               </div>
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-2xl opacity-30 group-hover:opacity-60 blur-sm animate-pulse"></div>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* TAB SWITCHER */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
          {(['healbook', 'aiscan', 'findcare'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMapMode('idle');
              }}
              className={`flex items-center gap-4 px-8 py-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-lg border-2 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200 scale-105'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-blue-100'
              }`}
            >
              {tab === 'healbook' && <BookOpen size={20} />}
              {tab === 'aiscan' && <Zap size={20} />}
              {tab === 'findcare' && <MapPin size={20} />}
              {tab === 'healbook' ? 'Thư viện' : tab === 'aiscan' ? 'AI Sàng lọc' : 'Cơ sở Y tế'}
            </button>
          ))}
        </div>

        {/* TAB: HEALBOOK */}
        {activeTab === 'healbook' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-10 space-y-4">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                 <Activity className="text-blue-600" size={32} /> Thư viện EduHealth
               </h2>
               <p className="text-slate-500 text-base max-w-3xl font-medium leading-relaxed">Bách khoa toàn thư thu nhỏ dành cho học sinh và phụ huynh. Cung cấp thông tin chuẩn xác về các dấu hiệu, cách phòng tránh lây lan trong môi trường học tập.</p>
            </div>

            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-blue-100 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-40 transition-opacity" />
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Tìm bệnh lý, dấu hiệu hoặc cách xử trí..."
                className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border-2 border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none shadow-lg text-base font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHealbook.map(topic => (
                <div key={topic.id} onClick={() => handleOpenDetail(topic)} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">{topic.category}</span>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Activity size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors mb-4">{topic.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 flex-1">{topic.shortDescription}</p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-blue-600 font-black text-xs uppercase tracking-widest">
                    Xem chi tiết <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: AI SCAN */}
        {activeTab === 'aiscan' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-12 text-white relative">
                <div className="absolute right-[-10%] top-[-20%] opacity-10 rotate-12">
                   <Zap size={300} />
                </div>
                <div className="relative z-10 space-y-4">
                  <h2 className="text-4xl font-black flex items-center gap-4"><Camera size={40} /> Sàng lọc AI thông minh</h2>
                  <p className="text-blue-100 text-base max-w-lg font-medium leading-relaxed">Sử dụng sức mạnh của AI Multimodal để phân tích triệu chứng và cung cấp bản đồ nhiệt nhận dạng chuyên sâu.</p>
                </div>
              </div>

              <div className="p-12 grid lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Camera size={16} className="text-blue-600" /> Tải ảnh hoặc chụp trực tiếp
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-video rounded-[2rem] border-2 border-dashed transition-all relative overflow-hidden group shadow-lg ${selectedImage ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}
                    >
                      {selectedImage ? (
                        <div className="w-full h-full relative">
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                          {showHeatmap && aiResult && (
                             <div className="absolute inset-0 heatmap-overlay animate-in fade-in duration-1000" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                             <button onClick={(e) => {e.stopPropagation(); setSelectedImage(null); setAiResult(null); setShowHeatmap(false);}} className="bg-white/90 p-4 rounded-full text-red-600 hover:bg-white shadow-lg"><X size={24}/></button>
                             <button onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click();}} className="bg-white/90 p-4 rounded-full text-blue-600 hover:bg-white shadow-lg"><RefreshCcw size={24}/></button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10">
                          <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                             <Upload size={32} />
                          </div>
                          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Bấm để chọn ảnh</p>
                          <p className="text-xs text-slate-400 mt-3 font-medium italic max-w-sm">Ưu tiên ảnh đủ sáng, chụp trực diện vùng tổn thương</p>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => { setSelectedImage(reader.result as string); setAiResult(null); };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>

                  <div className="space-y-6">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <FileText size={16} className="text-blue-600" /> Mô tả cảm giác lâm sàng
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Mô tả cụ thể cảm giác (đau nhức, ngứa châm chích), tiền sử dị ứng hoặc nhiệt độ cơ thể hiện tại..."
                      className="w-full h-48 p-8 rounded-[2rem] border-2 border-slate-200 outline-none text-base font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none shadow-inner bg-slate-50/30"
                    />
                  </div>

                  <button
                    onClick={callAI}
                    disabled={loading || (!inputText && !selectedImage)}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-8 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} />}
                    {loading ? 'Hệ thống đang phân tích...' : 'Tiến hành sàng lọc thông minh'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-[3rem] border border-slate-100 p-12 flex flex-col shadow-inner">
                  {aiResult ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8 h-full">
                      <div className="flex flex-col gap-8">
                        <div className={`p-6 rounded-3xl border-2 flex items-center justify-between shadow-lg ${
                          aiResult.urgency === UrgencyLevel.URGENT_DOCTOR ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          <div className="flex items-center gap-4">
                             <AlertTriangle size={28} />
                             <span className="text-sm font-black uppercase tracking-widest">{aiResult.urgency}</span>
                          </div>
                          {selectedImage && (
                             <button
                               onClick={() => setShowHeatmap(!showHeatmap)}
                               className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-lg ${showHeatmap ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50'}`}
                             >
                                {showHeatmap ? 'Ẩn bản đồ nhiệt' : 'Xem bản đồ nhiệt'}
                             </button>
                          )}
                        </div>

                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{aiResult.title}</h3>
                      </div>
                      
                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
                        <div className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm">
                           <p className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Dấu hiệu nguy hiểm (Cần đi khám ngay)</p>
                           <ul className="text-xs text-slate-700 space-y-3">
                              {aiResult.dangerSigns.map((d, i) => <li key={i} className="flex gap-3 items-start"><span className="w-5 h-5 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0 font-bold">!</span> {d}</li>)}
                           </ul>
                        </div>

                        <div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Phân tích chuyên sâu của AI</p>
                           <ul className="text-xs text-slate-600 space-y-3">
                              {aiResult.analysis.map((a, i) => <li key={i} className="flex gap-4 items-start"><CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" /> {a}</li>)}
                           </ul>
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                           <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={16} /> Khuyến nghị EduHealth</p>
                           <ul className="text-xs text-indigo-900/80 space-y-3 font-medium">
                              {aiResult.safetyAdvice.map((s, i) => <li key={i} className="flex gap-4 items-start"><span className="w-5 h-5 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">{i+1}</span> {s}</li>)}
                           </ul>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-200">
                         <button onClick={() => setActiveTab('findcare')} className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm">
                            <MapPin size={18} className="text-indigo-600" /> Tìm cơ sở y tế gần nhất
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                      <div className="bg-white w-28 h-28 rounded-full flex items-center justify-center shadow-xl mb-8">
                         <Stethoscope size={56} className="text-slate-300" />
                      </div>
                      <h4 className="text-lg font-black text-slate-500 uppercase tracking-tighter">Đang chờ dữ liệu đầu vào</h4>
                      <p className="text-xs text-slate-400 mt-4 max-w-[250px] leading-relaxed font-medium">Cung cấp hình ảnh hoặc mô tả triệu chứng để EduHealth AI bắt đầu quy trình sàng lọc kỹ thuật số.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FIND CARE (MAPS) */}
        {activeTab === 'findcare' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-4">
                  <MapIcon className="text-blue-600" size={36} /> Tìm nơi Chăm sóc
               </h2>
               <p className="text-slate-500 text-base max-w-lg mx-auto font-medium leading-relaxed">Dựa trên vị trí của bạn, chúng tôi đề xuất các cơ sở y tế và nhà thuốc uy tín trong khu vực lân cận.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <button
                onClick={() => handleFindCare('hospital')}
                className={`flex flex-col items-center gap-8 p-12 rounded-[3rem] border-2 transition-all group shadow-lg ${mapMode === 'hospital' ? 'border-red-500 bg-red-50 shadow-xl shadow-red-100' : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-red-100'}`}
              >
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all shadow-lg ${mapMode === 'hospital' ? 'bg-red-500 text-white animate-pulse-red' : 'bg-red-50 text-red-500 group-hover:scale-110'}`}>
                   <Hospital size={40} />
                </div>
                <div className="text-center">
                  <span className="font-black uppercase tracking-widest text-sm block mb-2">Bệnh viện & Phòng khám</span>
                  <p className="text-xs font-bold text-slate-400">Ưu tiên cấp cứu & chuyên khoa</p>
                </div>
              </button>

              <button
                onClick={() => handleFindCare('pharmacy')}
                className={`flex flex-col items-center gap-8 p-12 rounded-[3rem] border-2 transition-all group shadow-lg ${mapMode === 'pharmacy' ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-emerald-100'}`}
              >
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all shadow-lg ${mapMode === 'pharmacy' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500 group-hover:scale-110'}`}>
                   <ShoppingCart size={40} />
                </div>
                <div className="text-center">
                  <span className="font-black uppercase tracking-widest text-sm block mb-2">Nhà thuốc & Hiệu thuốc</span>
                  <p className="text-xs font-bold text-slate-400">Vật tư y tế & Thuốc không kê đơn</p>
                </div>
              </button>
            </div>

            {mapMode !== 'idle' && (
               <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="h-[500px] w-full relative bg-slate-100 rounded-[2.8rem] overflow-hidden" ref={mapContainerRef}>
                     <div id="map"></div>

                     <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-[10] pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-3xl shadow-2xl border border-slate-100 text-sm font-black uppercase tracking-widest text-slate-600 flex items-center gap-3">
                           <Users size={16} className="text-blue-600" /> Phát hiện {mapMode === 'hospital' ? '4 bệnh viện' : '5 nhà thuốc'} lân cận
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFindCare(mapMode as any); }}
                          className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-100 pointer-events-auto hover:bg-white active:scale-95 transition-all text-blue-600"
                        >
                           <RefreshCcw size={20} />
                        </button>
                     </div>

                     <div className="absolute bottom-8 left-8 right-8 z-[10]">
                        <button
                           onClick={() => window.open(`https://www.google.com/maps/search/${mapMode === 'hospital' ? 'bệnh+viện' : 'nhà+thuốc'}/@${location?.lat || 21.0},${location?.lng || 105.8},14z`, '_blank')}
                           className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-blue-300 transition-all active:scale-[0.98] pointer-events-auto flex items-center justify-center gap-4"
                        >
                           <ExternalLink size={20} /> Mở bản đồ trực tuyến chuyên sâu
                        </button>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* MODAL HEALBOOK DETAIL */}
        {selectedTopic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedTopic(null)} />
             <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                   <div className="flex items-center gap-4">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{selectedTopic.category}</span>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedTopic.title}</h3>
                   </div>
                   <button onClick={() => setSelectedTopic(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={28} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar bg-white">
                   <div className="space-y-4">
                      <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                         <img src={selectedTopic.educationalImages[0].url} alt={selectedTopic.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] text-slate-500 text-center font-medium italic px-4">"{selectedTopic.educationalImages[0].caption}"</p>
                   </div>

                   <section className="space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Info size={22} />
                        <h4 className="font-black text-sm uppercase tracking-widest">Mô tả tình trạng</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-[1.7] font-medium">{selectedTopic.shortDescription}</p>
                   </section>

                   <section className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4">
                      <div className="flex items-center gap-3 text-indigo-800">
                        <School size={22} />
                        <h4 className="font-black text-sm uppercase tracking-widest">Tình huống lây truyền tại trường</h4>
                      </div>
                      <p className="text-xs text-indigo-900/80 leading-relaxed italic font-medium">{selectedTopic.schoolContext}</p>
                   </section>

                   <section className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 space-y-5">
                      <div className="flex items-center gap-3 text-red-600">
                        <AlertTriangle size={24} />
                        <h4 className="font-black text-sm uppercase tracking-widest">Dấu hiệu cần can thiệp y tế ngay</h4>
                      </div>
                      <ul className="space-y-3">
                        {selectedTopic.dangerSigns.map((s, i) => (
                          <li key={i} className="flex gap-4 text-xs text-red-900/90 font-bold items-start">
                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                   </section>

                   <section className="space-y-5">
                      <div className="flex items-center gap-3 text-emerald-600">
                        <ShieldCheck size={22} />
                        <h4 className="font-black text-sm uppercase tracking-widest">Hướng dẫn xử trí & Chăm sóc</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedTopic.safeActions.map((a, i) => (
                          <div key={i} className="flex gap-4 text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium">
                            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0">{i+1}</span> {a}
                          </div>
                        ))}
                      </div>
                   </section>

                   <section className="pt-8 border-t border-slate-100 space-y-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Thông tin tham khảo mở rộng</p>
                      <div className="flex flex-wrap gap-4">
                        {selectedTopic.references.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl transition-all border border-indigo-100">
                            <ExternalLink size={14} /> {r.title}
                          </a>
                        ))}
                      </div>
                   </section>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                   <button 
                      onClick={() => handleUseTopicFromModal(selectedTopic)}
                      className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                   >
                      <Camera size={20} /> Phân tích triệu chứng bằng AI
                   </button>
                   <button onClick={() => setSelectedTopic(null)} className="sm:w-32 bg-white border border-slate-200 text-slate-500 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">Đóng</button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* CHATBOT GUIDED UI */}
      {showChat && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[450px] sm:h-[680px] bg-white sm:rounded-[3rem] shadow-2xl border border-slate-100 z-[60] flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-500 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl shadow-lg backdrop-blur-sm">
                  <MessageSquare size={24} />
                </div>
                <div>
                   <h4 className="font-black text-lg leading-tight">Cố vấn EduHealth</h4>
                   <p className="text-xs font-bold uppercase tracking-widest opacity-80">Luôn sẵn sàng hỗ trợ 24/7</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-slate-50/80 to-white no-scrollbar">
             {!userRole ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="text-center space-y-4 mb-10">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                        <HeartPulse size={32} className="text-white" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">Chào bạn! 👋</h3>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">Rất vui được gặp bạn. Tôi là trợ lý EduHealth AI, chuyên hỗ trợ sức khỏe học đường.</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vui lòng chọn vai trò để tôi hỗ trợ tốt nhất</p>
                   </div>
                   {(['Học sinh', 'Phụ huynh', 'Cán bộ y tế'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => setUserRole(r)}
                        className="w-full bg-white border-2 border-slate-200 p-6 rounded-3xl text-base font-black text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group shadow-lg"
                      >
                         <span className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                             {r === 'Học sinh' ? '🎓' : r === 'Phụ huynh' ? '👨‍👩‍👧‍👦' : '🏥'}
                           </div>
                           {r}
                         </span>
                         <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                   ))}
                </div>
             ) : (
                <>
                  <div className="flex justify-start animate-in slide-in-from-left-4 duration-300">
                    <div className="max-w-[85%] p-6 rounded-3xl rounded-tl-md text-sm shadow-lg bg-gradient-to-r from-blue-50 to-teal-50 text-slate-700 border border-blue-100 font-medium leading-relaxed">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                           <span className="text-xs text-white font-bold">AI</span>
                         </div>
                         <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">EduHealth AI</span>
                       </div>
                       Chào {userRole}! Tôi là EduHealth AI. Bạn cần tra cứu thông tin hay tư vấn về tình trạng sức khỏe học đường nào?
                    </div>
                  </div>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-4 duration-300`}>
                      <div className={`max-w-[85%] p-5 rounded-3xl text-sm shadow-lg whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-br-md'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md'
                      }`}>
                        {msg.role === 'user' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs text-blue-600 font-bold">Bạn</span>
                            </div>
                          </div>
                        )}
                        {msg.content ?? msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                       <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-blue-600" />
                          </div>
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang trả lời...</span>
                       </div>
                    </div>
                  )}
                </>
             )}
          </div>

          <div className="p-8 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                disabled={!userRole || chatLoading}
                placeholder="Nhập tin nhắn của bạn..."
                className="w-full bg-white rounded-3xl px-8 py-5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-lg border-2 border-slate-200 disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { callChat(e.currentTarget.value); e.currentTarget.value = ''; } }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MessageSquare size={18} />
              </div>
            </div>
            <button
              disabled={!userRole || chatLoading}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-5 rounded-3xl shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-8 py-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => {setActiveTab('healbook'); setSelectedTopic(null);}} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === 'healbook' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
            <BookOpen size={22} className={activeTab === 'healbook' ? 'fill-indigo-50' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest">Thư viện</span>
          </button>
          <div className="w-16 h-16 bg-white rounded-full -mt-12 shadow-xl border border-slate-100 flex items-center justify-center">
             <button onClick={() => {setActiveTab('aiscan'); setSelectedTopic(null);}} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'aiscan' ? 'bg-indigo-600 text-white rotate-0 shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 rotate-12'}`}>
               <Zap size={24} />
             </button>
          </div>
          <button onClick={() => {setActiveTab('findcare'); setSelectedTopic(null);}} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === 'findcare' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
            <MapPin size={22} className={activeTab === 'findcare' ? 'fill-indigo-50' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest">Vị trí</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
