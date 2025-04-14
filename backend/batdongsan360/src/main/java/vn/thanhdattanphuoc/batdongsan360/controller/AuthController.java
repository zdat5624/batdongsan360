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
import vn.thanhdattanphuoc.batdongsan360.domain.request.LoginDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.request.RegisterDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResCreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResLoginDTO;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@RestController
public class AuthController {

    final private AuthenticationManagerBuilder authenticationManagerBuilder;
    final private SecurityUtil securityService;
    final private UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityService,
            UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityService = securityService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
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
                    currentUserDB.getRole());
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
        }

        return ResponseEntity.ok().body(userLogin);
    }

    @PostMapping("/api/auth/register")
    public ResponseEntity<ResCreateUserDTO> register(@Valid @RequestBody RegisterDTO registerDTO)
            throws IdInvalidException {
        boolean isEmailExist = this.userService.isEmailExist(registerDTO.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
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

}
