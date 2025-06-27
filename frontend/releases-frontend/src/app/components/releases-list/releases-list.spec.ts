import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasesList } from './releases-list';

describe('ReleasesList', () => {
  let component: ReleasesList;
  let fixture: ComponentFixture<ReleasesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleasesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleasesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
