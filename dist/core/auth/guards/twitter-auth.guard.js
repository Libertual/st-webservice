"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
let TwitterAuthGuard = class TwitterAuthGuard extends passport_1.AuthGuard('twitter') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        this.roles = this.reflector.get('roles', context.getHandler());
        return super.canActivate(context);
    }
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException(info);
        }
        if (this.roles) {
            if (user.roles && this.hasRole(user)) {
                return user;
            }
            else {
                throw new common_1.UnauthorizedException('Forbidden');
            }
        }
        return user;
    }
    hasRole(user) {
        return user.roles.some(role => !!this.roles.find(item => item === role));
    }
};
TwitterAuthGuard = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TwitterAuthGuard);
exports.TwitterAuthGuard = TwitterAuthGuard;
//# sourceMappingURL=twitter-auth.guard.js.map