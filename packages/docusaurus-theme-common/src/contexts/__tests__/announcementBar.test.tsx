/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';

vi.mock('@generated/site-storage', () => ({
  default: {
    type: 'localStorage',
    namespace: '',
  },
}));

import {AnnouncementBarProvider, useAnnouncementBar} from '../announcementBar';
import * as useThemeConfigModule from '../../utils/useThemeConfig';
import type {ThemeConfig} from '../../utils/useThemeConfig';

describe('announcementBar context', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('is active by default when announcementBar is configured', () => {
    vi.spyOn(useThemeConfigModule, 'useThemeConfig').mockReturnValue({
      announcementBar: {
        id: 'announcement-1',
        content: 'Hello',
        backgroundColor: '#000',
        textColor: '#fff',
        isCloseable: true,
      },
    } as unknown as ThemeConfig);

    const {result} = renderHook(() => useAnnouncementBar(), {
      wrapper: AnnouncementBarProvider,
    });

    expect(result.current.isActive).toBe(true);
  });

  it('remains inactive if dismissed for the same id', () => {
    localStorage.setItem('docusaurus.announcement.id', 'announcement-1');
    localStorage.setItem('docusaurus.announcement.dismiss', 'true');

    vi.spyOn(useThemeConfigModule, 'useThemeConfig').mockReturnValue({
      announcementBar: {
        id: 'announcement-1',
        content: 'Hello',
        backgroundColor: '#000',
        textColor: '#fff',
        isCloseable: true,
      },
    } as unknown as ThemeConfig);

    const {result} = renderHook(() => useAnnouncementBar(), {
      wrapper: AnnouncementBarProvider,
    });

    expect(result.current.isActive).toBe(false);
  });

  it('becomes active when announcement id changes, even if previously dismissed', () => {
    localStorage.setItem('docusaurus.announcement.id', 'announcement-1');
    localStorage.setItem('docusaurus.announcement.dismiss', 'true');

    vi.spyOn(useThemeConfigModule, 'useThemeConfig').mockReturnValue({
      announcementBar: {
        id: 'announcement-2',
        content: 'Hello New Announcement',
        backgroundColor: '#000',
        textColor: '#fff',
        isCloseable: true,
      },
    } as unknown as ThemeConfig);

    const {result} = renderHook(() => useAnnouncementBar(), {
      wrapper: AnnouncementBarProvider,
    });

    expect(result.current.isActive).toBe(true);
    expect(localStorage.getItem('docusaurus.announcement.id')).toBe(
      'announcement-2',
    );
    expect(localStorage.getItem('docusaurus.announcement.dismiss')).toBe(
      'false',
    );
  });

  it('can be closed and persists dismissed state', () => {
    vi.spyOn(useThemeConfigModule, 'useThemeConfig').mockReturnValue({
      announcementBar: {
        id: 'announcement-1',
        content: 'Hello',
        backgroundColor: '#000',
        textColor: '#fff',
        isCloseable: true,
      },
    } as unknown as ThemeConfig);

    const {result} = renderHook(() => useAnnouncementBar(), {
      wrapper: AnnouncementBarProvider,
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isActive).toBe(false);
    expect(localStorage.getItem('docusaurus.announcement.dismiss')).toBe(
      'true',
    );
  });
});
