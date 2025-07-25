import type { Meta, StoryObj } from '@storybook/react'

import { BellOutline, RussiaFlag, UkFlag } from '../../../assets/icons'
import { Button, Typography } from '../../atoms'
import { Select } from '../../molecules'
import { Header_v2 } from './Header_v2'

const meta: Meta<typeof Header_v2> = {
  component: Header_v2,
  tags: ['autodocs'],
  title: 'Components/Header_v2',
  parameters: {
    backgrounds: {
      // default: 'dark',
    },
  },
  argTypes: {
    maxWidth: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    background: {
      control: 'color',
      description: 'Background color of the header',
    },

    isAuthorized: {
      control: 'boolean',
      description: 'Determines whether to show authorized or unauthorized header',
    },
  },
}

export default meta
type Story = StoryObj<typeof Header_v2>

export const HeaderStories: Story = {
  args: {
    logo: <Typography variant={'large'}>IctRoot</Typography>, // Here is necessary to use Typography component and Link in real project
    // maxWidth: '1440px',
    children: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <button type={'button'}>
          <BellOutline size={24} />
        </button>
        <div style={{ paddingInline: '45px 36px' }}>
          <Select
            width={'163px'}
            defaultValue={'en'}
            placeholder={'Select...'}
            items={[
              { value: 'en', label: 'English', icon: <UkFlag /> },
              { value: 'rus', label: 'Russian', icon: <RussiaFlag /> },
            ]}
            onValueChange={() => {}}
          />
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Button variant={'text'}>Login</Button>
          <Button>Logout</Button>
        </div>
      </div>
    ),
  },
}
