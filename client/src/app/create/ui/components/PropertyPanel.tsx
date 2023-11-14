import { Divider, Typography } from '@mui/material';
import styles from './Property.module.scss';
import PropertyInput, { IInputProps } from './PropertyInput';

export interface IPropertyPanelSectionProps {
  name: string;
  items: Array<{
    name: string;
    input: IInputProps;
  }>;
}

export default function ({ name, items }: IPropertyPanelSectionProps) {
  return (
    <div className={styles['properties-panel-container']}>
      <Divider />
      {/* TODO: make this an h4! */}
      <Typography variant="h3">{name}</Typography>
      <Divider />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '47% 47%',
          gap: '6%',
          //   padding: '8px',
        }}
      >
        {items.map((input, i) => {
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: '8px',
                gridColumn: input.input.short ? 'span 1' : 'span 2',
              }}
            >
              <Typography
                sx={{
                  display: 'block',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
              >
                {input.name}:
              </Typography>
              <PropertyInput key={i} {...input.input} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
