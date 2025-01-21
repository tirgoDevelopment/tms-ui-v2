import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  LogoutOutline,
  UserOutline,
  LockOutline,
  UnlockOutline,
  EyeOutline,
  EyeInvisibleOutline,
  MailOutline,
  PlusOutline,
  EllipsisOutline,
  FilterFill,
  SyncOutline,
  FileSearchOutline,
  TeamOutline,
  FrownFill,
  ReloadOutline,
  PictureTwoTone,
  InfoCircleOutline,
  StarFill,
  PaperClipOutline,
  HistoryOutline,
  FileTextOutline,
  SendOutline,
  WechatOutline,
  ArrowLeftOutline,
  RollbackOutline,
  FilePdfOutline,
  CustomerServiceOutline,
  SettingOutline,
  CameraOutline,
  FireOutline,
  FileExcelFill
} from '@ant-design/icons-angular/icons';

const icons = [FileExcelFill,FireOutline, CameraOutline,CustomerServiceOutline, SettingOutline, FilePdfOutline,RollbackOutline,ArrowLeftOutline,WechatOutline,SendOutline,FileTextOutline,UnlockOutline,HistoryOutline,PaperClipOutline,StarFill,InfoCircleOutline,PictureTwoTone,ReloadOutline,FrownFill,TeamOutline,FileSearchOutline,SyncOutline,FilterFill,EllipsisOutline,MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline, LogoutOutline,UserOutline,LockOutline,EyeOutline,EyeInvisibleOutline,MailOutline,PlusOutline];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class IconsProviderModule {}