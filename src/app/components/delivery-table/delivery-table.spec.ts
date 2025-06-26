import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryTable } from './delivery-table';

describe('DeliveryTable', () => {
  let component: DeliveryTable;
  let fixture: ComponentFixture<DeliveryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
