import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EmergencyManuals() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  // 다국어 텍스트 함수를 먼저 정의
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '응급 매뉴얼',
        subtitle: '재난 유형별 대응 방법을 확인하세요',
        back_to_dashboard: '대시보드로 돌아가기',
        select_disaster_type: '재난 유형을 선택하세요',
        no_manual_available: '해당 매뉴얼은 준비 중입니다',
        coming_soon: '준비 중',
        natural_disasters: '자연재해',
        man_made_disasters: '인적재해',
        earthquake: '지진',
        flood: '홍수',
        typhoon: '태풍',
        landslide: '산사태',
        cold_wave: '한파',
        heat_wave: '폭염',
        fire: '화재',
        gas_leak: '가스누출',
        chemical_spill: '화학물질 유출',
        building_collapse: '건물 붕괴',
        terrorism: '테러'
      },
      en: {
        title: 'Emergency Manuals',
        subtitle: 'Check response methods by disaster type',
        back_to_dashboard: 'Back to Dashboard',
        select_disaster_type: 'Select disaster type',
        no_manual_available: 'This manual is under preparation',
        coming_soon: 'Coming Soon',
        natural_disasters: 'Natural Disasters',
        man_made_disasters: 'Man-made Disasters',
        earthquake: 'Earthquake',
        flood: 'Flood',
        typhoon: 'Typhoon',
        landslide: 'Landslide',
        cold_wave: 'Cold Wave',
        heat_wave: 'Heat Wave',
        fire: 'Fire',
        gas_leak: 'Gas Leak',
        chemical_spill: 'Chemical Spill',
        building_collapse: 'Building Collapse',
        terrorism: 'Terrorism'
      },
      vi: {
        title: 'Sổ Tay Khẩn Cấp',
        subtitle: 'Kiểm tra phương pháp ứng phó theo loại thảm họa',
        back_to_dashboard: 'Quay lại Bảng điều khiển',
        select_disaster_type: 'Chọn loại thảm họa',
        no_manual_available: 'Sổ tay này đang được chuẩn bị',
        coming_soon: 'Sắp ra mắt',
        natural_disasters: 'Thảm họa Tự nhiên',
        man_made_disasters: 'Thảm họa Nhân tạo',
        earthquake: 'Động đất',
        flood: 'Lũ lụt',
        typhoon: 'Bão',
        landslide: 'Sạt lở đất',
        cold_wave: 'Rét đậm',
        heat_wave: 'Nắng nóng',
        fire: 'Cháy',
        gas_leak: 'Rò rỉ khí',
        chemical_spill: 'Tràn hóa chất',
        building_collapse: 'Sập nhà',
        terrorism: 'Khủng bố'
      },
      zh: {
        title: '应急手册',
        subtitle: '按灾害类型查看应对方法',
        back_to_dashboard: '返回仪表板',
        select_disaster_type: '选择灾害类型',
        no_manual_available: '该手册正在准备中',
        coming_soon: '即将推出',
        natural_disasters: '自然灾害',
        man_made_disasters: '人为灾害',
        earthquake: '地震',
        flood: '洪水',
        typhoon: '台风',
        landslide: '山体滑坡',
        cold_wave: '寒潮',
        heat_wave: '热浪',
        fire: '火灾',
        gas_leak: '气体泄漏',
        chemical_spill: '化学品泄漏',
        building_collapse: '建筑物倒塌',
        terrorism: '恐怖主义'
      }
    };
    
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  const manualCategories = [
    {
      id: 'natural',
      title: getText('natural_disasters'),
      icon: '🌍',
      color: 'bg-green-100 border-green-300 hover:bg-green-200',
      items: [
        { 
          key: 'earthquake', 
          icon: '🏚️', 
          severity: 'critical',
          name: getText('earthquake')
        },
        { 
          key: 'flood', 
          icon: '🌊', 
          severity: 'high',
          name: getText('flood')
        },
        { 
          key: 'typhoon', 
          icon: '🌀', 
          severity: 'high',
          name: getText('typhoon')
        },
        { 
          key: 'landslide', 
          icon: '⛰️', 
          severity: 'high',
          name: getText('landslide')
        },
        { 
          key: 'cold_wave', 
          icon: '❄️', 
          severity: 'medium',
          name: getText('cold_wave')
        },
        { 
          key: 'heat_wave', 
          icon: '🌡️', 
          severity: 'medium',
          name: getText('heat_wave')
        }
      ]
    },
    {
      id: 'man_made',
      title: getText('man_made_disasters'),
      icon: '🏭',
      color: 'bg-red-100 border-red-300 hover:bg-red-200',
      items: [
        { 
          key: 'fire', 
          icon: '🔥', 
          severity: 'critical',
          name: getText('fire')
        },
        { 
          key: 'gas_leak', 
          icon: '💨', 
          severity: 'critical',
          name: getText('gas_leak')
        },
        { 
          key: 'chemical_spill', 
          icon: '☣️', 
          severity: 'critical',
          name: getText('chemical_spill')
        },
        { 
          key: 'building_collapse', 
          icon: '🏢', 
          severity: 'high',
          name: getText('building_collapse')
        },
        { 
          key: 'terrorism', 
          icon: '🚨', 
          severity: 'critical',
          name: getText('terrorism')
        }
      ]
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { 
        color: 'bg-red-600 text-white', 
        text: language === 'ko' ? '매우위험' : 
              language === 'en' ? 'Critical' : 
              language === 'vi' ? 'Rất nguy hiểm' : 
              '极危险'
      },
      high: { 
        color: 'bg-orange-500 text-white', 
        text: language === 'ko' ? '위험' : 
              language === 'en' ? 'High Risk' : 
              language === 'vi' ? 'Nguy hiểm' : 
              '危险'
      },
      medium: { 
        color: 'bg-yellow-500 text-white', 
        text: language === 'ko' ? '주의' : 
              language === 'en' ? 'Medium Risk' : 
              language === 'vi' ? 'Cảnh báo' : 
              '注意'
      }
    };
    return config[severity as keyof typeof config] || config.medium;
  };

  const handleManualClick = (manualKey: string) => {
    if (manualKey === 'earthquake') {
      // 지진 매뉴얼은 전용 페이지로 이동
      setLocation('/earthquake-manual');
    } else {
      // 다른 재난은 현재는 대시보드로 이동
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getText('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {getText('subtitle')}
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="rounded-full"
            >
              <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
              {getText('back_to_dashboard')}
            </Button>
          </div>
        </div>

        {/* Manual Categories */}
        <div className="space-y-6">
          {manualCategories.map((category) => (
            <Card key={category.id} className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {category.items.map((item) => {
                    const severityConfig = getSeverityBadge(item.severity);
                    return (
                      <Button
                        key={item.key}
                        variant="outline"
                        className={`h-24 flex flex-col items-center justify-center p-4 border-2 hover:scale-105 transition-transform duration-200 ${category.color}`}
                        onClick={() => handleManualClick(item.key)}
                      >
                        <span className="text-2xl mb-2">{item.icon}</span>
                        <Badge className={`${severityConfig.color} text-xs mb-1`}>
                          {severityConfig.text}
                        </Badge>
                        <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {item.name}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 shadow-lg border-0 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-info-circle text-xl" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {getText('select_disaster_type')}
                </h3>
                <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                  {getText('no_manual_available')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}