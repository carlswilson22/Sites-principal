import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { InventoryPage } from './InventoryPage';

export function HomePage(props) {
  return <div data-store-layout="explorer" className="pb-16"><HeroSection onNavigate={props.onNavigate} favoritesCount={props.favoritesCount} comparedCount={props.comparedCount} /><InventoryPage {...props} embedded /></div>;
}
