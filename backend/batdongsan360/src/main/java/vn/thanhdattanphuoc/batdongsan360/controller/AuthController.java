package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.service.ForgotPasswordService;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.annotation.ApiMessage;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.InputInvalidException;
import vn.thanhdattanphuoc.batdongsan360.util.request.EmailRequest;
import vn.thanhdattanphuoc.batdongsan360.util.request.LoginDTO;
import vn.thanhdattanphuoc.batdongsan360.util.request.RegisterDTO;
import vn.thanhdattanphuoc.batdongsan360.util.request.ResetPasswordRequest;
import vn.thanhdattanphuoc.batdongsan360.util.response.MessageDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.ResCreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.ResLoginDTO;

@RestController
public class AuthController {

    final private AuthenticationManagerBuilder authenticationManagerBuilder;
    final private SecurityUtil securityService;
    final private UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ForgotPasswordService forgotPasswordService;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityService,
            UserService userService, PasswordEncoder passwordEncoder, ForgotPasswordService forgotPasswordService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityService = securityService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody LoginDTO loginDTO) {

        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(), loginDTO.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // create a token
        String access_token = this.securityService.createToken(authentication);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResLoginDTO res = new ResLoginDTO();
        res.setAccessToken(access_token);
        User currentUserDB = this.userService.handleGetUserByUserName(loginDTO.getUsername());
        if (currentUserDB != null) {
            ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin(
                    currentUserDB.getId(),
                    currentUserDB.getEmail(),
                    currentUserDB.getName(),
                    currentUserDB.getRole(),
                    currentUserDB.getAvatar(),
                    currentUserDB.getBalance(),
                    currentUserDB.getGender(),
                    currentUserDB.getPhone());
            res.setUser(userLogin);
        }

        return ResponseEntity.ok().body(res);
    }

    @GetMapping("/api/auth/account")
    public ResponseEntity<ResLoginDTO.UserLogin> getAccount() {

        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        User currentUserDB = this.userService.handleGetUserByUserName(email);
        ResLoginDTO.UserLogin userLogin = new ResLoginDTO.UserLogin();

        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setName(currentUserDB.getName());
            userLogin.setRole(currentUserDB.getRole());
            userLogin.setAvatar(currentUserDB.getAvatar());
            userLogin.setBalance(currentUserDB.getBalance());
            userLogin.setGender(currentUserDB.getGender());
            userLogin.setPhone(currentUserDB.getPhone());
        }

        return ResponseEntity.ok().body(userLogin);
    }

    @PostMapping("/api/auth/register")
    public ResponseEntity<ResCreateUserDTO> register(@Valid @RequestBody RegisterDTO registerDTO)
            throws InputInvalidException {
        boolean isEmailExist = this.userService.isEmailExist(registerDTO.getEmail());
        if (isEmailExist) {
            throw new InputInvalidException(
                    "Email " + registerDTO.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        User newUser = new User();
        String hashPassword = this.passwordEncoder.encode(registerDTO.getPassword());
        newUser.setName(registerDTO.getName());
        newUser.setPhone(registerDTO.getPhone());
        newUser.setEmail(registerDTO.getEmail());
        newUser.setGender(registerDTO.getGender());
        newUser.setPassword(hashPassword);
        newUser.setRole(RoleEnum.USER);
        newUser.setCreatedBy(registerDTO.getEmail());
        User currentUserDB = this.userService.handleCreateUser(newUser);

        ResCreateUserDTO res = new ResCreateUserDTO();
        res.setId(currentUserDB.getId());
        res.setName(currentUserDB.getName());
        res.setEmail(currentUserDB.getEmail());
        res.setRole(currentUserDB.getRole());
        res.setGender(currentUserDB.getGender());
        res.setPhone(currentUserDB.getPhone());
        res.setCreatedAt(currentUserDB.getCreatedAt());
        res.setCreatedBy(currentUserDB.getCreatedBy());

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @ApiMessage("Mã xác nhận đã được gửi đến email của bạn.")
    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody EmailRequest request)
            throws InputInvalidException {
        forgotPasswordService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(null);
    }

    @ApiMessage("Đổi mật khẩu thành công")
    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request)
            throws InputInvalidException {
        forgotPasswordService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(null);
    }

}
