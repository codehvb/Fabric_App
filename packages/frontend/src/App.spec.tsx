//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom has no WebGL, so stand in for the 3D carousel.
vi.mock('@/components/showcase/carousel-scene', () => ({
  CarouselScene: () => <div data-testid="carousel-scene" />,
}));

// Charts render through Vega, which jsdom can't draw; the labs' numbers are what matter here.
vi.mock('@/components/strategy/strategy-charts', () => ({
  SugarChart: () => null,
  CostChart: () => null,
  SeasonChart: () => null,
}));

const fetchMenu = vi.fn();
vi.mock('@/data/menu', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/menu')>()),
  fetchMenu: () => fetchMenu(),
  fetchMonthly: async () => [],
  fetchPortfolioMonthly: async () => [],
}));

import App from '@/App';
import { MENU_FIXTURE } from '@/test/menu-fixture';

describe('App', () => {
  beforeEach(() => {
    fetchMenu.mockReset();
  });

  it('shows the menu, its portfolio KPIs, and the front smoothie', async () => {
    fetchMenu.mockResolvedValue(MENU_FIXTURE);
    render(<App />);
    expect(await screen.findByRole('navigation', { name: 'Smoothie menu' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /menu performance across 2 smoothies/i })).toHaveTextContent('$1.55M');
    for (const smoothie of MENU_FIXTURE) {
      expect(screen.getAllByText(smoothie.name).length).toBeGreaterThan(0);
    }
  });

  it('opens and closes the KPI panel for a smoothie', async () => {
    fetchMenu.mockResolvedValue(MENU_FIXTURE);
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /view all kpis/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(MENU_FIXTURE[0].name);
    expect(dialog).toHaveTextContent('71.5%');
    expect(dialog).toHaveTextContent('2,140 reviews');
    expect(await screen.findByText(/no monthly history/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
  });

  it('opens the strategy room with the research and the labs', async () => {
    fetchMenu.mockResolvedValue(MENU_FIXTURE);
    render(<App />);
    fireEvent.click(await screen.findByRole('tab', { name: /strategy room/i }));
    expect(
      await screen.findByRole('heading', { name: /six pressure points on innocent/i }, { timeout: 10000 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sugar and the health halo/i })).toBeInTheDocument();
    expect(screen.getByText(/blends over daily max/i).nextElementSibling).toHaveTextContent('2 / 2');
    expect(screen.getByRole('link', { name: /orange juice prices reach new record high/i })).toHaveAttribute(
      'href',
      expect.stringContaining('freshplaza.com')
    );
  });

  it('explains an empty menu instead of loading forever', async () => {
    fetchMenu.mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'The menu is empty' })).toBeInTheDocument();
  });

  it('surfaces a load failure with a retry', async () => {
    fetchMenu.mockRejectedValueOnce(new Error('HTTP 403 Forbidden')).mockResolvedValue(MENU_FIXTURE);
    render(<App />);
    expect(await screen.findByText(/doesn't have access/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('navigation', { name: 'Smoothie menu' })).toBeInTheDocument();
  });
});
