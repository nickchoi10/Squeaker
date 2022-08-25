import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { UtilizerFormService } from './utilizer-form.service';
import { UtilizerService } from '../service/utilizer.service';
import { IUtilizer } from '../utilizer.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { UtilizerUpdateComponent } from './utilizer-update.component';

describe('Utilizer Management Update Component', () => {
  let comp: UtilizerUpdateComponent;
  let fixture: ComponentFixture<UtilizerUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let utilizerFormService: UtilizerFormService;
  let utilizerService: UtilizerService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [UtilizerUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(UtilizerUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UtilizerUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    utilizerFormService = TestBed.inject(UtilizerFormService);
    utilizerService = TestBed.inject(UtilizerService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const utilizer: IUtilizer = { id: 456 };
      const user: IUser = { id: 19570 };
      utilizer.user = user;

      const userCollection: IUser[] = [{ id: 94659 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ utilizer });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const utilizer: IUtilizer = { id: 456 };
      const user: IUser = { id: 22691 };
      utilizer.user = user;

      activatedRoute.data = of({ utilizer });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.utilizer).toEqual(utilizer);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUtilizer>>();
      const utilizer = { id: 123 };
      jest.spyOn(utilizerFormService, 'getUtilizer').mockReturnValue(utilizer);
      jest.spyOn(utilizerService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ utilizer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: utilizer }));
      saveSubject.complete();

      // THEN
      expect(utilizerFormService.getUtilizer).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(utilizerService.update).toHaveBeenCalledWith(expect.objectContaining(utilizer));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUtilizer>>();
      const utilizer = { id: 123 };
      jest.spyOn(utilizerFormService, 'getUtilizer').mockReturnValue({ id: null });
      jest.spyOn(utilizerService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ utilizer: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: utilizer }));
      saveSubject.complete();

      // THEN
      expect(utilizerFormService.getUtilizer).toHaveBeenCalled();
      expect(utilizerService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUtilizer>>();
      const utilizer = { id: 123 };
      jest.spyOn(utilizerService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ utilizer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(utilizerService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
