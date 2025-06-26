import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseInfo } from './release-info';

describe('ReleaseInfo', () => {
  let component: ReleaseInfo;
  let fixture: ComponentFixture<ReleaseInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
